import {
  AuxiliaryStrategy,
  RepresentationConverter,
  RepresentationConvertingStore,
  RepresentationPreferences,
  ResourceStore
} from "@solid/community-server";
import type {ResourceIdentifier} from "@solid/community-server/dist/http/representation/ResourceIdentifier";
import type {Conditions} from "@solid/community-server/dist/storage/conditions/Conditions";
import type {Representation} from "@solid/community-server/dist/http/representation/Representation";
import type {ChangeMap} from "@solid/community-server/dist/storage/ResourceStore";
import { DataFactory } from 'n3';
import namedNode = DataFactory.namedNode;

export class CustomRepresentationConvertingStore<T extends ResourceStore = ResourceStore> extends RepresentationConvertingStore<T> {
  public constructor(source: T, metadataStrategy: AuxiliaryStrategy, options: {
    outConverter?: RepresentationConverter;
    inConverter?: RepresentationConverter;
    inPreferences?: RepresentationPreferences;
  }) {
    super(source, metadataStrategy, options);
    this.logger.info('We just made our custom RepresentationConvertingStore!');
  }

  public async getRepresentation(identifier: ResourceIdentifier, preferences: RepresentationPreferences, conditions?: Conditions): Promise<Representation> {
    return await super.getRepresentation(identifier, preferences, conditions);
  }
  public async addResource(identifier: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ChangeMap> {
    this.logger.info(`We just called custom addResource(): identifier: ${identifier.path}!`);
    return super.addResource(identifier, representation, conditions);

  }
  public async setRepresentation(identifier: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ChangeMap> {
    this.logger.info(`We just called custom setRepresentation(): identifier: ${identifier.path}!`);
    /*try {
      const currentRepresentation = await this.getRepresentation(identifier, {}, conditions);
      const newIdentifier = { path: identifier.path + (new Date()).toISOString().replace(":",".") };
      await super.setRepresentation(newIdentifier, currentRepresentation, conditions);
      this.logger.info(`We just created a copy of the old resource at: ${newIdentifier.path}!`);
    } catch (error) {
      this.logger.error(error as string);
    }*/
    return super.setRepresentation(identifier, representation, conditions);
  }
}