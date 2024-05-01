import { QueryEngine } from '@comunica/query-sparql';
import { NotImplementedHttpError, OkResponseDescription, OperationHandler, OperationHandlerInput, OperationHttpHandlerInput, RepresentationMetadata, ResourceStore, ResponseDescription, TEXT_TURTLE, serializeQuads } from "@solid/community-server";
import { APPLICATION_SPARQL_VERSION_QUERY } from './utils/ContentTypes';
import { getDeltaIdentifier } from './utils/DeltaUtil';
import { readableToQuads } from './utils/QuadUtil';
import { VS_PREFIX } from './utils/VS';

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

        const sparql = `PREFIX vso: <${VS_PREFIX}> CONSTRUCT {?s vso:delta_date ?date .} WHERE {?s vso:delta_date ?date . ?s vso:next_delta ?next_delta . FILTER (!isBlank(?next_delta)) }`
        const deltaQuadStream = await this.engine.queryQuads(sparql, { sources: [deltaStore], baseIRI: deltaRepresentationIdentifier.path })

        const deltaQuads = await deltaQuadStream.toArray()

        return new OkResponseDescription(new RepresentationMetadata(TEXT_TURTLE), serializeQuads(deltaQuads))
    }
}