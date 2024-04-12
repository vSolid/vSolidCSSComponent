import { QueryEngine } from '@comunica/query-sparql';
import type { Bindings, Quad, Term } from '@rdfjs/types';
import { ConflictHttpError, InternalServerError, NotImplementedHttpError, RdfStorePatcherInput, Representation, RepresentationPatcher, RepresentationPatcherInput, ResourceIdentifier, getLoggerFor, uniqueQuads } from "@solid/community-server";
import { N3Patch, isN3Patch } from "@solid/community-server/dist/http/representation/N3Patch";
import type { Store } from 'n3';
import { mapTerms } from 'rdf-terms';
import type { SparqlGenerator } from 'sparqljs';
import { Generator, Wildcard } from 'sparqljs';

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

  private readonly engine: QueryEngine;
  private readonly generator: SparqlGenerator;

  public constructor() {
    super()
    this.logger.info('CustomN3Patcher is initialized!');
    this.engine = new QueryEngine();
    this.generator = new Generator();
  }

  public async canHandle({ patch }: RepresentationPatcherInput<RdfDatasetRepresentation>): Promise<void> {
    if (!isN3Patch(patch)) {
      throw new NotImplementedHttpError('Only N3 Patch updates are supported');
    }
  }

  public async handle(input: RepresentationPatcherInput<RdfDatasetRepresentation>): Promise<RdfDatasetRepresentation> {
    if (!input.representation) {
      throw new InternalServerError('Patcher requires a representation as input.');
    }

    this.logger.info("Now performing N3 Patching")

    const store = input.representation.dataset;

    const patch = input.patch as N3Patch;

    if (patch.deletes.length === 0 && patch.inserts.length === 0 && patch.conditions.length === 0) {
      this.logger.debug('Empty patch, returning input.');
      return input.representation;
    }

    await this.patch({
      identifier: input.identifier,
      patch,
      store,
    });

    return input.representation;
  }

  private async patch({ identifier, patch, store }: RdfStorePatcherInput): Promise<Store> {
    this.logger.debug(`${store.size} quads in ${identifier.path}.`);

    const { deletes, inserts } = await this.applyConditions(patch as N3Patch, identifier, store);

    // Apply deletes
    if (deletes.length > 0) {
      // There could potentially be duplicates after applying conditions,
      // which would result in an incorrect count.
      const uniqueDeletes = uniqueQuads(deletes);
      // Solid, §5.3.1: "The triples resulting from ?deletions are to be removed from the RDF dataset."
      const oldSize = store.size;
      store.removeQuads(uniqueDeletes);

      // Solid, §5.3.1: "If the set of triples resulting from ?deletions is non-empty and the dataset
      // does not contain all of these triples, the server MUST respond with a 409 status code."
      if (oldSize - store.size !== uniqueDeletes.length) {
        throw new ConflictHttpError(
          'The document does not contain all triples the N3 Patch requests to delete, which is required for patching.',
        );
      }
      this.logger.debug(`Deleted ${oldSize - store.size} quads from ${identifier.path}.`);
    }

    // Solid, §5.3.1: "The triples resulting from ?insertions are to be added to the RDF dataset,
    // with each blank node from ?insertions resulting in a newly created blank node."
    store.addQuads(inserts);

    this.logger.debug(`${store.size} total quads after patching ${identifier.path}.`);

    return store;
  }

  private async applyConditions(patch: N3Patch, identifier: ResourceIdentifier, source: Store): Promise<N3Patch> {
    const { conditions } = patch;
    let { deletes, inserts } = patch;

    if (conditions.length > 0) {
      // Solid, §5.3.1: "If ?conditions is non-empty, find all (possibly empty) variable mappings
      // such that all of the resulting triples occur in the dataset."
      const sparql = this.generator.stringify({
        type: 'query',
        queryType: 'SELECT',
        variables: [ new Wildcard() ],
        prefixes: {},
        where: [{
          type: 'bgp',
          triples: conditions,
        }],
      });
      this.logger.debug(`Finding bindings using SPARQL query ${sparql}`);
      const bindingsStream = await this.engine.queryBindings(sparql, { sources: [ source ], baseIRI: identifier.path });
      const bindings: Bindings[] = await arrayifyStream(bindingsStream);

      // Solid, §5.3.1: "If no such mapping exists, or if multiple mappings exist,
      // the server MUST respond with a 409 status code."
      if (bindings.length === 0) {
        throw new ConflictHttpError(
          'The document does not contain any matches for the N3 Patch solid:where condition.',
        );
      }
      if (bindings.length > 1) {
        throw new ConflictHttpError(
          'The document contains multiple matches for the N3 Patch solid:where condition, which is not allowed.',
        );
      }

      // Apply bindings to deletes/inserts
      deletes = deletes.map((quad): Quad => mapTerms(quad, (term): Term =>
        term.termType === 'Variable' ? bindings[0].get(term)! : term));
      inserts = inserts.map((quad): Quad => mapTerms(quad, (term): Term =>
        term.termType === 'Variable' ? bindings[0].get(term)! : term));
    }

    return {
      ...patch,
      deletes,
      inserts,
      conditions: [],
    };
  }
}

function arrayifyStream(bindingsStream: any): Bindings[] | PromiseLike<Bindings[]> {
  throw new Error("Function not implemented.");
}
