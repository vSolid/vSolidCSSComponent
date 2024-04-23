import { ETagHandler, GetOperationHandler, HttpRequest, OkResponseDescription, Operation, OperationHttpHandlerInput, ResourceIdentifier, ResourceStore, ResponseDescription } from "@solid/community-server"
import { QueryEngine } from '@comunica/query-sparql'
import { Readable } from "stream"
import { Store, Parser } from "n3"

export class ArchiveGetOperationHandler extends GetOperationHandler {
    private readonly _store
    private readonly engine

    constructor(store: ResourceStore, eTagHandler: ETagHandler) {
        super(store, eTagHandler)
        this._store = store
        this.engine = new QueryEngine()
    }

    public async handle({ request, operation }: OperationHttpHandlerInput): Promise<ResponseDescription> {
        let query = this.getSparqlQuery(request)
        if (!query) {
            return super.handle({ operation })
        } else {
            return this.handleQuery(operation, query)
        }
    }

    public async handleQuery(operation: Operation, query: String): Promise<ResponseDescription> {
        let identifier = operation.target
        let delta_identifier = this.getDeltaIdentifier(identifier)

        let body = await this._store.getRepresentation(delta_identifier, operation.preferences, operation.conditions)

        let parser = new Parser()
        let data = await this.readStream(body.data)
        let existingQuads = parser.parse(data)

        const store = new Store()
        store.addQuads(existingQuads)

        const bindingsStream = await this.engine.queryBindings(`${query}`, {
            sources: [store],
        });

        bindingsStream.on('data', (binding) => {
            console.log(binding.toString());
        })

        return new OkResponseDescription(body.metadata, body.data)
    }

    private getDeltaIdentifier(fromIdentifier: ResourceIdentifier): ResourceIdentifier {
        return { path: fromIdentifier.path + ".vSolid" }
    }

    private getSparqlQuery(fromRequest: HttpRequest): String | null {
        let url = new URL("http://dummy" + fromRequest.url)
        const queryParams = url.searchParams
        return queryParams.get("query")
    }

    private async readStream(stream: Readable): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let data = ''

            stream.on('data', (chunk: any) => {
                data += chunk?.toString() ?? ''
            })

            stream.on('end', () => {
                resolve(data)
            })

            stream.on('error', (err: Error) => {
                reject(err)
            })
        })
    }
}