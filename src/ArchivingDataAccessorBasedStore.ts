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
  getLoggerFor,
} from "@solid/community-server";

export class ArchivingDataAccessorBasedStore extends DataAccessorBasedStore {
  protected readonly logger = getLoggerFor(this);

  public constructor(
    accessor: DataAccessor,
    identifierStrategy: IdentifierStrategy,
    auxiliaryStrategy: AuxiliaryStrategy,
    metadataStrategy: AuxiliaryStrategy,
  ) {
    super(accessor, identifierStrategy, auxiliaryStrategy, metadataStrategy);
  }

  public async getRepresentation(
    identifier: ResourceIdentifier,
  ): Promise<Representation> {
    this.logger.info("Someone was trying to GET something!");

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

    return super.modifyResource(identifier, patch, conditions);
  }
}
