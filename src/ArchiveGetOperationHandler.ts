import { BasicRepresentation, ETagHandler, FileDataAccessor, GetOperationHandler, HttpRequest, INTERNAL_QUADS, OkResponseDescription, Operation, OperationHandler, OperationHttpHandlerInput, RepresentationMetadata, ResourceIdentifier, ResourceStore, ResponseDescription, endOfStream, readableToQuads, readableToString } from "@solid/community-server"
import { QueryEngine } from '@comunica/query-sparql'
import { Readable } from "stream"
import { Store, Parser, Quad } from "n3"
import { Bindings, BindingsStream } from "@comunica/types"
import arrayifyStream from 'arrayify-stream'
import { RdfDatasetRepresentation } from "@solid/community-server/dist/http/representation/RdfDatasetRepresentation"
import { inspect, promisify } from "node:util"

export class ArchiveGetOperationHandler extends GetOperationHandler {
    private readonly _store: ResourceStore;
    private readonly engine

    public constructor(store: ResourceStore, eTagHandler: ETagHandler) {
        super(store, eTagHandler);
        this._store = store;
        this.engine = new QueryEngine()
    }

    public async handle({ request, operation }: OperationHttpHandlerInput): Promise<ResponseDescription> {
        let query = this.getSparqlQuery(request)
        if (!query) {
            return await super.handle({ operation })
        } else {
            return await this.handleQuery(operation, query)
        }
    }

    public async handleQuery(operation: Operation, query: String): Promise<ResponseDescription> {
        let identifier = operation.target
        let delta_identifier = this.getDeltaIdentifier(identifier)

        let representation = await this._store.getRepresentation(delta_identifier, operation.preferences, operation.conditions)

        const inputRepresentation: RdfDatasetRepresentation = representation ?
            representation as RdfDatasetRepresentation :
            new BasicRepresentation() as RdfDatasetRepresentation


        let str = await this.readStream(representation.data)
        const parser = new Parser();
        let existingQuads = parser.parse(str);
        let store = new Store()
        store.addQuads(existingQuads)

        inputRepresentation.dataset = store

        const bindingsStream = await this.engine.queryBindings(`${query}`, { sources: [store] })
        const bindings: Bindings[] = await arrayifyStream(bindingsStream)

        bindings.forEach((binding) => {
            console.log(binding.toString())
        })

        let representation2 = await this._store.getRepresentation(delta_identifier, operation.preferences, operation.conditions)

        return new OkResponseDescription(representation2.metadata, representation2.data)
    }

    private async readStream(stream: Readable): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let data = '';

            stream.on('data', (chunk: any) => {
                data += chunk?.toString() ?? '';
            });


            stream.on('end', () => {
                resolve(data);
            });

            stream.on('error', (err: Error) => {
                reject(err);
            });
        });
    }

    private getDeltaIdentifier(fromIdentifier: ResourceIdentifier): ResourceIdentifier {
        return { path: fromIdentifier.path + ".vSolid" }
    }

    private getSparqlQuery(fromRequest: HttpRequest): String | null {
        let url = new URL("http://dummy" + fromRequest.url)
        const queryParams = url.searchParams
        return queryParams.get("query")
    }
}
