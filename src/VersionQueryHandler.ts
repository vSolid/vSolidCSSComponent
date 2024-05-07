import { QueryEngine } from '@comunica/query-sparql';
import type { Quad } from '@rdfjs/types';
import { NotImplementedHttpError, OkResponseDescription, OperationHandler, OperationHandlerInput, OperationHttpHandlerInput, RepresentationMetadata, ResourceStore, ResponseDescription, TEXT_TURTLE, serializeQuads } from "@solid/community-server";
import { DataFactory } from "n3";
import { APPLICATION_SPARQL_VERSION_QUERY } from './utils/ContentTypes';
import { getDeltaIdentifier } from './utils/DeltaUtil';
import { readableToQuads } from './utils/QuadUtil';
import { VS } from './utils/VS';

/**
 * Handles Version Query for archiving.
 */
export class VersionQueryHandler extends OperationHandler {
    protected readonly store: ResourceStore
    private readonly engine

    public constructor(store: ResourceStore) {
        super()
        this.store = store
        this.engine = new QueryEngine()
    }

    public async canHandle({ request, operation }: OperationHttpHandlerInput): Promise<void> {
        if (operation.method !== 'GET') {
            throw new NotImplementedHttpError('This handler only supports GET operations');
        }

        if (request.headers['content-type'] != APPLICATION_SPARQL_VERSION_QUERY) {
            throw new NotImplementedHttpError('This handler only supports version query operations');
        }
    }

    public async handle({ operation }: OperationHandlerInput): Promise<ResponseDescription> {
        const currentRepresentationIdentifier = operation.target
        const deltaRepresentationIdentifier = getDeltaIdentifier(currentRepresentationIdentifier)

        const deltaRepresentation = await this.store.getRepresentation(deltaRepresentationIdentifier, operation.preferences, operation.conditions)
        const deltaStore = await readableToQuads(deltaRepresentation.data)

        let quads: Quad[] = []
        const raw = deltaStore.match(null, DataFactory.namedNode(VS.delta_date), null)
        for (const quad of raw) {
            quads.push(quad)
        }

        return new OkResponseDescription(new RepresentationMetadata(TEXT_TURTLE), serializeQuads(quads))
    }
}