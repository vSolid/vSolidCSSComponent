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
  ChangeMap,
  Conditions,
  DataAccessor,
  DataAccessorBasedStore,
  IdentifierStrategy,
  Patch,
  Representation,
  RepresentationMetadata,
  ResourceIdentifier,
  SparqlUpdatePatch,
  getLoggerFor,
  guardStream,
  Guarded,
} from "@solid/community-server";
import { inspect } from 'util'
import { DataFactory, StreamWriter, Parser } from "n3";
import { Duplex, Readable } from "stream";
import { Algebra } from 'sparqlalgebrajs';
import { Quad, Term } from "rdf-js";
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

  public async getRepresentation(
    identifier: ResourceIdentifier,
  ): Promise<Representation> {
    this.logger.info("Someone was trying to GET something!");

    this.logger.info(identifier.path)

    return super.getRepresentation(identifier);
  }

  public async setRepresentation(
    identifier: ResourceIdentifier,
    representation: Representation,
    conditions?: Conditions | undefined,
  ): Promise<ChangeMap> {
    this.logger.info("Someone was trying to PUT something!");
    return super.setRepresentation(identifier, representation, conditions);
  }

  public async addResource(
    container: ResourceIdentifier,
    representation: Representation,
    conditions?: Conditions | undefined,
  ): Promise<ChangeMap> {
    this.logger.info("Someone was trying to POST something!");

    this.logger.info("ØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØØ");

    return super.addResource(container, representation, conditions);
  }

  public async deleteResource(
    identifier: ResourceIdentifier,
    conditions?: Conditions | undefined,
  ): Promise<ChangeMap> {
    this.logger.info("Someone was trying to DELETE something!");

    return super.deleteResource(identifier, conditions);
  }

  public async modifyResource(
    identifier: ResourceIdentifier,
    patch: Patch,
    conditions?: Conditions | undefined,
  ): Promise<never> {
    this.logger.info("Someone was trying to PATCH something!");

    this.logger.info(`identifier: ${identifier.path}`, )

    if (this.isSparqlUpdate(patch)) {
      this.logger.info("It's a SPARQL Update Patch!")
      const sparqlupdatepatch = (patch as SparqlUpdatePatch)
      this.logger.warn("Patch path: " + identifier.path);
      const deltaId = await this.generateDelta(identifier, sparqlupdatepatch);
      patch.metadata.set(DataFactory.namedNode(VS.next_delta), deltaId);
      this.dataaccessor.writeMetadata(identifier, patch.metadata);
    }else{
        this.logger.info("It's a regular Patch!")
    }

    
    return await super.modifyResource(identifier, patch, conditions);
  }

  private async generateDelta(identifier: ResourceIdentifier, patch: SparqlUpdatePatch, conditions?: Conditions) : Promise<string> {
    const deltaId = uuid();
    const deltaIdentifier = this.generateDeltaIdentifier(identifier);
    
    let existingQuads: Quad[] = [];
    try {
      const existingDeltaDataStream = await this.dataaccessor.getData(deltaIdentifier)
      const existingDeltaData = await this.readStream(existingDeltaDataStream);
      const parser = new Parser();
      existingQuads = parser.parse(existingDeltaData);
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

    const newPatch : Patch = {
      data: this.generateStreamFromArray(allQuadsToWrite),
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

  private async readStream(stream: Readable): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let data = '';
  
      stream.on('data', (chunk: any) => {
        data += chunk?.toString() ?? '';
      });
  
      stream.on('end', () => {
        resolve(data);
      });
  
      stream.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  private generateDeltaIdentifier(identifier: ResourceIdentifier) : ResourceIdentifier {
    return { path: identifier.path + ".vSolid" }
  }

  private generateDeltaQuadsFromAlgebraUpdate(algebra: Algebra.Update) : Quad[] {
    switch (algebra.type) {
      case Algebra.types.COMPOSITE_UPDATE:
        return algebra.updates?.map(update => this.generateOperationQuadsFromUpdates(update))?.flat() ?? [];
      case Algebra.types.DELETE_INSERT:
        return this.generateOperationQuadsFromUpdates(algebra);
    }
    return [];
  }

  private generateOperationQuadsFromUpdates(algebra: Algebra.Update | Algebra.Pattern) : Quad[] {
    return [
      ...algebra?.delete?.map((q: Quad) => this.generateOperationQuad(q, "delete")) ?? [],
      ...algebra?.insert?.map((q: Quad) => this.generateOperationQuad(q, "insert")) ?? [],
    ]
  }

  private generateOperationQuad(quad: Quad, operation: keyof VS) : Quad {
    const copyQuad = DataFactory.quad(quad.subject, quad.predicate, quad.object);
    const operationQuad = DataFactory.quad(copyQuad, DataFactory.namedNode(VS.operation), DataFactory.namedNode(VS[operation]));
    return operationQuad;
  }

  private generateStreamFromArray<T>(values: T[]) : Guarded<Readable> {
    const writer = new StreamWriter({ format: 'Turtle' });
    const ttl : string[] = []

    const duplexStream = new Duplex({
      read(size) {
        // No need to implement if only writing is required
      },
      write(chunk, encoding, callback) {
        const str = chunk.toString();
        if (str) {
          ttl.push(str);
        }
        callback();
      },
      final(callback) {
        callback();
      }
    });

    writer.pipe(duplexStream);
    values.forEach(q => writer.write(q));
    writer._flush((err) => { if (err) { console.error(err); } });	
    writer.end();
    const readableStream = Readable.from(ttl);
    return guardStream(readableStream);
  }

  private printObject<T>(object: T, consoleType: "info" | "warn" | "error" = "info", depth: number = 10) {
    this.logger[consoleType](inspect(object, undefined, depth))
  }

  private generateNodeFromTerm(term: Term) {
    switch (term.termType) {
      case 'NamedNode':
        return DataFactory.namedNode(term.value);
      case 'BlankNode':
        return DataFactory.blankNode(term.value);
      case 'Literal':
        return DataFactory.literal(term.value, term.language);
      case 'Variable':
        return DataFactory.variable(term.value);
      case 'DefaultGraph':
        return DataFactory.defaultGraph();
      default:
        return null;
    }
  }

  private isSparqlUpdate(patch: Patch): patch is SparqlUpdatePatch {
    return typeof (patch as SparqlUpdatePatch).algebra === 'object';
  }
}