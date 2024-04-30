/*
  <S, P, O>

  <DeltaId1, vs:applies_to, <<S1, P1, O1>, vs:operation, +>> 
  <DeltaId1, vs:applies_to, <<S2, P2, O2>, vs:operation, ->> 
  <DeltaId1, vs:applies_to, <<S2, P2, O2>, vs:operation, +>> 
  <DeltaId1, vs:delta_date, date>
  <DeltaId1, vs:next_delta, DeltaId2>
  
  <DeltaId2, vs:applies_to, <<S1, P1, O1>, vs:operation, +>> 
  <DeltaId2, vs:applies_to, <<S2, P2, O2>, vs:operation, ->> 
  <DeltaId2, vs:applies_to, <<S2, P2, O2>, vs:operation, +>> 
  <DeltaId2, vs:delta_date, date>
  <DeltaId2, vs:next_delta, DeltaId2>
*/

import type { Quad } from '@rdfjs/types';
import {
  AuxiliaryStrategy,
  Conditions,
  DataAccessor,
  DataAccessorBasedStore,
  IdentifierStrategy,
  Patch,
  RepresentationMetadata,
  ResourceIdentifier,
  SparqlUpdatePatch,
  getLoggerFor,
  parseQuads,
  serializeQuads,
} from "@solid/community-server";
import { DataFactory } from "n3";
import { Algebra } from 'sparqlalgebrajs';
import { v4 as uuid } from 'uuid';
import { getDeltaIdentifier } from "./utils/DeltaUtil";
import { VS } from "./utils/VS";

export class ArchivingDataAccessorBasedStore extends DataAccessorBasedStore {
  protected readonly logger = getLoggerFor(this);
  private readonly dataaccessor: DataAccessor;

  public constructor(
    accessor: DataAccessor,
    identifierStrategy: IdentifierStrategy,
    auxiliaryStrategy: AuxiliaryStrategy,
    metadataStrategy: AuxiliaryStrategy,
  ) {
    super(accessor, identifierStrategy, auxiliaryStrategy, metadataStrategy);
    this.dataaccessor = accessor
  }

  public async modifyResource(
    identifier: ResourceIdentifier,
    patch: Patch,
    conditions?: Conditions | undefined,
  ): Promise<never> {
    if (this.isSparqlUpdate(patch)) {
      const sparqlPatch = (patch as SparqlUpdatePatch)
      const deltaID = await this.generateDelta(identifier, sparqlPatch);

      patch.metadata.set(DataFactory.namedNode(VS.next_delta), deltaID);

      this.dataaccessor.writeMetadata(identifier, patch.metadata);
    }

    return await super.modifyResource(identifier, patch, conditions);
  }

  private async generateDelta(identifier: ResourceIdentifier, patch: SparqlUpdatePatch, conditions?: Conditions): Promise<string> {
    const deltaID = uuid();
    const deltaResourceIdentifier = getDeltaIdentifier(identifier);
    const existingQuads = await this.existingDeltaQuads(deltaResourceIdentifier)

    const existingMetadataStream = await this.dataaccessor.getMetadata(identifier)

    const headDeltaID = existingMetadataStream.get(DataFactory.namedNode(VS.next_delta));

    const changeOperations = this.generateDeltaQuadsFromAlgebraUpdate(patch.algebra);

    // map operation quads to delta quads
    const deltaDateQuad = DataFactory.quad(
      DataFactory.namedNode(deltaID),
      DataFactory.namedNode(VS.delta_date),
      DataFactory.literal((new Date()).toISOString())
    );
    const nextDeltaQuad = DataFactory.quad(
      DataFactory.namedNode(deltaID),
      DataFactory.namedNode(VS.next_delta),
      headDeltaID?.value
        ? DataFactory.namedNode(headDeltaID.value)
        : DataFactory.blankNode()
    );

    const allQuadsToWrite = [
      ...existingQuads,
      ...changeOperations?.map(operation => this.mapOperationQuadToDeltaQuad(operation, deltaID)),
      deltaDateQuad,
      nextDeltaQuad
    ];

    const newPatch: Patch = {
      data: serializeQuads(allQuadsToWrite),
      isEmpty: patch.isEmpty,
      metadata: new RepresentationMetadata(),
      binary: false,
    };

    await this.writeData(
      deltaResourceIdentifier,   // identifier
      newPatch,                  // representation
      false,                     // isContainer
      true,                      // createContainers
      true                       // exists
    );

    return deltaID;
  }

  private async existingDeltaQuads(deltaResourceIdentifier: ResourceIdentifier): Promise<Quad[]> {
    try {
      const existingDeltaDataStream = await this.dataaccessor.getData(deltaResourceIdentifier)
      let existingDeltas = await parseQuads(existingDeltaDataStream)
      if (!existingDeltas) {
        throw new Error("Could not read existing deltas")
      }
      return existingDeltas
    } catch (error) {
      return [];
    }
  }

  private mapOperationQuadToDeltaQuad(operationQuad: Quad, deltaId: string) {
    return DataFactory.quad(DataFactory.namedNode(deltaId), DataFactory.namedNode(VS.contains_operation), operationQuad);
  }

  private generateDeltaQuadsFromAlgebraUpdate(algebra: Algebra.Update): Quad[] {
    switch (algebra.type) {
      case Algebra.types.COMPOSITE_UPDATE:
        return algebra.updates?.map(update => this.generateOperationQuadsFromUpdates(update))?.flat() ?? [];
      case Algebra.types.DELETE_INSERT:
        return this.generateOperationQuadsFromUpdates(algebra);
    }
    return [];
  }

  private generateOperationQuadsFromUpdates(algebra: Algebra.Update | Algebra.Pattern): Quad[] {
    return [
      ...algebra?.delete?.map((q: Quad) => this.generateOperationQuad(q, "delete")) ?? [],
      ...algebra?.insert?.map((q: Quad) => this.generateOperationQuad(q, "insert")) ?? [],
    ]
  }

  private generateOperationQuad(quad: Quad, operation: keyof VS): Quad {
    const copyQuad = DataFactory.quad(quad.subject, quad.predicate, quad.object);
    const operationQuad = DataFactory.quad(copyQuad, DataFactory.namedNode(VS.operation), DataFactory.namedNode(VS[operation]));
    return operationQuad;
  }

  private isSparqlUpdate(patch: Patch): patch is SparqlUpdatePatch {
    return typeof (patch as SparqlUpdatePatch).algebra === 'object';
  }
}