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

/**
 * Supports application/sparql-update PATCH requests on RDF resources.
 *
 * Only DELETE/INSERT updates without variables are supported.
 */
export class CustomSparqlUpdatePatcher extends RepresentationPatcher<RdfDatasetRepresentation> {
  protected readonly logger = getLoggerFor(this);

  public constructor() {
    super();
    this.logger.info('CustomSparqlUpdatePatcher is initialized!');
  }

  public async canHandle({ patch }: RepresentationPatcherInput<RdfDatasetRepresentation>): Promise<void> {
    
  }

  public async handle({ identifier, patch, representation }: RepresentationPatcherInput<RdfDatasetRepresentation>):
  Promise<RdfDatasetRepresentation> {
    if (!representation) {
      throw new InternalServerError('Patcher requires a representation as input.');
    }

    this.logger.info("Now performing Sparql Patching")

    return representation;
  }
}
