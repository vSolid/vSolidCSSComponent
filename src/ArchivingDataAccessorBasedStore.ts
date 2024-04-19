import {
  AuxiliaryStrategy,
  BaseClientCredentialsStore,
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
} from "@solid/community-server";
import { inspect } from 'util'
import { DataFactory, StreamWriter } from "n3";
import { Duplex, Readable } from "stream";

export const VS = {
  operation: "https://vsolid.org/properties#operation",
  delete: "https://vsolid.org/properties#delete",
  insert: "https://vsolid.org/properties#insert",
  delta_date: "https://vsolid.org/properties#delta_date",
  delta_author: "https://vsolid.org/properties#delta_author",
  next_delta: "https://vsolid.org/properties#next_delta",
} as const;

export class ArchivingDataAccessorBasedStore extends DataAccessorBasedStore {
  protected readonly logger = getLoggerFor(this);

  private readonly quad = DataFactory.quad;
  private readonly namedNode = DataFactory.namedNode;
  private readonly literal = DataFactory.literal;

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
      this.logger.warn("Patch" + inspect(sparqlupdatepatch.algebra, undefined, 10));
      await this.generateDelta(identifier, sparqlupdatepatch);
    }else{
        this.logger.info("It's a regular Patch!")
    }
    
    return await super.modifyResource(identifier, patch, conditions);
  }

  private async generateDelta(identifier: ResourceIdentifier, patch: SparqlUpdatePatch, conditions?: Conditions) {
    const algebra = patch.algebra;
    
    const quadList = [];
    switch (algebra.type) {
      case 'compositeupdate':
        for (const update of algebra.updates ?? []) {
          if (update.delete) {
            for (const q of update.delete) {
              const _q = this.quad(this.namedNode(q.subject.value), this.namedNode(q.predicate.value), this.literal(q.object.value));
              const newQuad = this.quad(_q, this.namedNode(VS.operation), this.namedNode(VS.delete));
              quadList.push(newQuad);
            }
          }
          if (update.insert) {
            for (const q of update.insert) {
              const _q = this.quad(this.namedNode(q.subject.value), this.namedNode(q.predicate.value), this.literal(q.object.value));
              const newQuad = this.quad(_q, this.namedNode(VS.operation), this.namedNode(VS.insert));
              quadList.push(newQuad);
            }
          }
        }
        break;
      case 'deleteinsert':
        if (algebra.delete) {
          for (const q of algebra.delete) {
            const _q = this.quad(this.namedNode(q.subject.value), this.namedNode(q.predicate.value), this.literal(q.object.value));
            const newQuad = this.quad(_q, this.namedNode(VS.operation), this.namedNode(VS.delete));
            quadList.push(newQuad);
          }
        }
        if (algebra.insert) {
          for (const q of algebra.insert) {
            const _q = this.quad(this.namedNode(q.subject.value), this.namedNode(q.predicate.value), this.literal(q.object.value));
            const newQuad = this.quad(_q, this.namedNode(VS.operation), this.namedNode(VS.insert));
            quadList.push(newQuad);
          }
        }
        break;
    }

    const writer = new StreamWriter({ format: 'Turtle' });
    const ttl : string[] = []

    const duplexStream = new Duplex({
      read(size) {
        // No need to implement if only writing is required
      },
      write(chunk, encoding, callback) {
        const str = chunk.toString();
        if (str && str !== ".\n") {
          ttl.push(chunk.toString());
        }
        callback();
      },
      final(callback) {
        callback();
      }
    });

    writer.pipe(duplexStream);

    quadList.forEach(q => writer.write(q));

    writer._flush((err) => { if (err) { console.error(err); } });	
    writer.end();

    const readableStream = Readable.from(ttl);
    const stream = guardStream(readableStream);

    const deltaIdentifier = { path: identifier.path + "-delta" }
    
    const delta_date = VS.delta_date;
    const date = (new Date()).toISOString();
    const next_delta = VS.next_delta;

    const meta = new RepresentationMetadata(deltaIdentifier, {
      delta_date: date, 
      next_delta: ""
    });

    const newPatch : Patch = {
      data: stream,
      isEmpty: patch.isEmpty,
      metadata: meta,
      binary: false,
    };

    await this.writeData(deltaIdentifier, newPatch, false, true, true);
  }

  private isSparqlUpdate(patch: Patch): patch is SparqlUpdatePatch {
    return typeof (patch as SparqlUpdatePatch).algebra === 'object';
  }
}