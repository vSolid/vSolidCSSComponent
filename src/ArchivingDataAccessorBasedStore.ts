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
import { inspect } from 'util'
import { DataFactory } from "n3";
import { Algebra } from 'sparqlalgebrajs';
import { Quad } from "rdf-js";
import { v4 as uuid } from 'uuid';

export const VS = {
  operation: "https://vsolid.org/properties#operation",
  delete: "https://vsolid.org/properties#delete",
  insert: "https://vsolid.org/properties#insert",
  delta_date: "https://vsolid.org/properties#delta_date",
  delta_author: "https://vsolid.org/properties#delta_author",
  next_delta: "https://vsolid.org/properties#next_delta",
  contains_operation: "https://vsolid.org/properties#contains_operation",
} as const;

type VS = typeof VS;

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
      const sparqlupdatepatch = (patch as SparqlUpdatePatch)
      this.logger.warn("Patch path: " + identifier.path);
      const deltaId = await this.generateDelta(identifier, sparqlupdatepatch);
      patch.metadata.set(DataFactory.namedNode(VS.next_delta), deltaId);
      this.dataaccessor.writeMetadata(identifier, patch.metadata);
    }

    return await super.modifyResource(identifier, patch, conditions);
  }

  private async generateDelta(identifier: ResourceIdentifier, patch: SparqlUpdatePatch, conditions?: Conditions): Promise<string> {
    const deltaId = uuid();
    const deltaIdentifier = this.generateDeltaIdentifier(identifier);

    let existingQuads: Quad[] = [];
    try {
      const existingDeltaDataStream = await this.dataaccessor.getData(deltaIdentifier)
      existingQuads = await parseQuads(existingDeltaDataStream)
    } catch (error) {
      this.printObject(error, "error");
    }

    const existingMetadataStream = await this.dataaccessor.getMetadata(identifier)

    const headDeltaId = existingMetadataStream.get(DataFactory.namedNode(VS.next_delta));

    const operationQuads = this.generateDeltaQuadsFromAlgebraUpdate(patch.algebra);

    // map operation quads to delta quads
    const deltaDateQuad = DataFactory.quad(
      DataFactory.namedNode(deltaId),
      DataFactory.namedNode(VS.delta_date),
      DataFactory.literal((new Date()).toISOString())
    );
    const nextDeltaQuad = DataFactory.quad(
      DataFactory.namedNode(deltaId),
      DataFactory.namedNode(VS.next_delta),
      headDeltaId?.value
        ? DataFactory.namedNode(headDeltaId.value)
        : DataFactory.blankNode()
    );

    const allQuadsToWrite = [
      ...existingQuads,
      ...operationQuads?.map(q => this.mapOperationQuadToDeltaQuad(q, deltaId)),
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
      deltaIdentifier,      // identifier
      newPatch,             // representation
      false,                // isContainer
      true,                 // createContainers
      true                  // exists
    );

    return deltaId;
  }

  private mapOperationQuadToDeltaQuad(operationQuad: Quad, deltaId: string) {
    return DataFactory.quad(DataFactory.namedNode(deltaId), DataFactory.namedNode(VS.contains_operation), operationQuad);
  }

  private generateDeltaIdentifier(identifier: ResourceIdentifier): ResourceIdentifier {
    return { path: identifier.path + ".vSolid" }
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

  private printObject<T>(object: T, consoleType: "info" | "warn" | "error" = "info", depth: number = 10) {
    this.logger[consoleType](inspect(object, undefined, depth))
  }

  private isSparqlUpdate(patch: Patch): patch is SparqlUpdatePatch {
    return typeof (patch as SparqlUpdatePatch).algebra === 'object';
  }
}