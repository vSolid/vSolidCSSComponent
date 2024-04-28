import { QueryEngine } from '@comunica/query-sparql';
import { NotImplementedHttpError, OkResponseDescription, OperationHandlerInput, OperationHttpHandlerInput, PostOperationHandler, RepresentationMetadata, ResourceStore, ResponseDescription, readableToString, serializeQuads } from "@solid/community-server";
import { APPLICATION_SPARQL_VERSION_QUERY } from './utils/ContentTypes';
import { getDeltaIdentifier } from './utils/DeltaUtil';
import { readableToQuads } from './utils/QuadUtil';

/**
 * Handles Version Query for archiving.
 */
export class VersionQueryHandler extends PostOperationHandler {
    private readonly _store: ResourceStore
    private readonly engine

    public constructor(store: ResourceStore) {
        super(store)
        this._store = store
        this.engine = new QueryEngine()
    }

    public async canHandle({ request }: OperationHttpHandlerInput): Promise<void> {
        if (request.headers['content-type'] != APPLICATION_SPARQL_VERSION_QUERY) {
            throw new NotImplementedHttpError('This handler only supports version query operations');
        }
    }

    public async handle({ operation }: OperationHandlerInput): Promise<ResponseDescription> {
        let currentRepresentationIdentifier = operation.target
        let deltaRepresentationIdentifier = getDeltaIdentifier(currentRepresentationIdentifier)

        let deltaRepresentation = await this._store.getRepresentation(deltaRepresentationIdentifier, operation.preferences, operation.conditions)
        let deltaStore = await readableToQuads(deltaRepresentation.data)

        const sparql = await readableToString(operation.body.data)
        const deltaQuadStream = await this.engine.queryQuads(sparql, { sources: [deltaStore], baseIRI: deltaRepresentationIdentifier.path })

        const deltaQuads = await deltaQuadStream.toArray()

        return new OkResponseDescription(new RepresentationMetadata(), serializeQuads(deltaQuads))
    }
}