import { InternalServerError, NotImplementedHttpError, Patch, Representation, RepresentationPatcher, RepresentationPatcherInput, SparqlUpdatePatch, getLoggerFor } from "@solid/community-server";
import type { Store } from 'n3';
import { Algebra } from 'sparqlalgebrajs';

interface RdfDatasetRepresentation extends Representation {
  data: never;
  dataset: Store;
}

export class CustomSparqlUpdatePatcher extends RepresentationPatcher<RdfDatasetRepresentation> {
  protected readonly logger = getLoggerFor(this);

  public constructor() {
    super();
    this.logger.info('CustomSparqlUpdatePatcher is initialized!');
  }

  public async canHandle({ patch }: RepresentationPatcherInput<RdfDatasetRepresentation>): Promise<void> {
    if (!this.isSparqlUpdate(patch)) {
      throw new NotImplementedHttpError('Only SPARQL update patches are supported');
    }
  }

  private isSparqlUpdate(patch: Patch): patch is SparqlUpdatePatch {
    return typeof (patch as SparqlUpdatePatch).algebra === 'object';
  }

  public async handle({ identifier, patch, representation }: RepresentationPatcherInput<RdfDatasetRepresentation>):
    Promise<RdfDatasetRepresentation> {
    const operation = (patch as SparqlUpdatePatch).algebra;

    if (!representation) {
      throw new InternalServerError('Patcher requires a representation as input.');
    }

    const sparqlupdatepatch = (patch as SparqlUpdatePatch)

    if (operation.type == Algebra.types.DELETE_INSERT) {
      this.logger.info(`inserts", ${sparqlupdatepatch.algebra.insert}`)
      this.logger.info(`deletes,  ${sparqlupdatepatch.algebra.delete}`)
    } 

    //const store = representation.dataset;

    this.logger.info("Now performing Sparql Patching")

    return representation;
  }
}
