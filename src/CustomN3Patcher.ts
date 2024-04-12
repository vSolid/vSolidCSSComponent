import { InternalServerError, Representation, RepresentationPatcher, RepresentationPatcherInput, getLoggerFor } from "@solid/community-server";
import type { Store } from 'n3';

interface RdfDatasetRepresentation extends Representation {
  /**
   * In {@link RdfDatasetRepresentation}, there is no data stream.
   */
  data: never;
  /**
   * The data of this representation which conforms to the RDF/JS Dataset interface
   * (https://rdf.js.org/dataset-spec/#dataset-interface).
   */
  dataset: Store;
}

export class CustomN3Patcher extends RepresentationPatcher<RdfDatasetRepresentation> {
  protected readonly logger = getLoggerFor(this);

  public constructor() {
    super()
    this.logger.info('CustomN3Patcher is initialized!');
  }

  public async handle(input: RepresentationPatcherInput<RdfDatasetRepresentation>): Promise<RdfDatasetRepresentation> {
    if (!input.representation) {
      throw new InternalServerError('Patcher requires a representation as input.');
    }
    
    this.logger.info("Now performing N3 Patching")
    
    return input.representation;
  }
}