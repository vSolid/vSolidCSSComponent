import {
  AuxiliaryStrategy,
  ChangeMap,
  Conditions,
  DataAccessor,
  DataAccessorBasedStore,
  IdentifierStrategy,
  Patch,
  Representation,
  ResourceIdentifier,
  SparqlUpdatePatch,
  getLoggerFor
} from "@solid/community-server";
import { inspect } from 'util'

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

    // this.logger.info(`${JSON.stringify(identifier)},  ${JSON.stringify(patch)}`)

    if (this.isSparqlUpdate(patch)) {
      this.logger.info("It's a SPARQL Update Patch!")
      const sparqlupdatepatch = (patch as SparqlUpdatePatch)
      this.logger.warn("Patch" + inspect(sparqlupdatepatch.algebra, undefined, 10));
    }else{
        this.logger.info("It's a regular Patch!")
    }


    return super.modifyResource(identifier, patch, conditions);
  }

  private isSparqlUpdate(patch: Patch): patch is SparqlUpdatePatch {
    return typeof (patch as SparqlUpdatePatch).algebra === 'object';
  }
}
