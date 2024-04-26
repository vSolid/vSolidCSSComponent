import { ETagHandler, GetOperationHandler, Guarded, HttpRequest, OkResponseDescription, Operation, OperationHttpHandlerInput, PostOperationHandler, RepresentationMetadata, ResourceIdentifier, ResourceStore, ResponseDescription, guardStream, readableToString } from "@solid/community-server"
import { QueryEngine } from '@comunica/query-sparql'
import { Duplex, Readable } from "stream"
import { Store, Parser, StreamWriter } from "n3"

export class SparQLOperationHandler extends PostOperationHandler {
    private readonly _store: ResourceStore
    private readonly engine

    public constructor(store: ResourceStore) {
        super(store)
        this._store = store
        this.engine = new QueryEngine()
    }

    public async handle({ request, operation }: OperationHttpHandlerInput): Promise<ResponseDescription> {
        if (request.headers["content-type"] == "application/sparql-archiving") {
            return await this.handleQuery(operation)
        } else {
            return await super.handle({ operation })
        }
    }

    public async handleQuery(operation: Operation): Promise<ResponseDescription> {
        let identifier = operation.target
        let delta_identifier = this.getDeltaIdentifier(identifier)

        let representation = await this._store.getRepresentation(delta_identifier, operation.preferences, operation.conditions)

        let str = await this.readStream(representation.data)
        const parser = new Parser()
        let existingQuads = parser.parse(str)
        let store = new Store()
        store.addQuads(existingQuads)

        const sparql = await readableToString(operation.body.data);
        const quadStream = await this.engine.queryQuads(sparql, { sources: [store], baseIRI: delta_identifier.path })
        const quads = await quadStream.toArray()

        return new OkResponseDescription(new RepresentationMetadata(), this.generateStreamFromArray(quads))
    }

    private generateStreamFromArray<T>(values: T[]): Guarded<Readable> {
        const writer = new StreamWriter({ format: 'Turtle' })
        const ttl: string[] = []

        const duplexStream = new Duplex({
            read(size) {
                // No need to implement if only writing is required
            },
            write(chunk, encoding, callback) {
                const str = chunk.toString()
                if (str) {
                    ttl.push(str)
                }
                callback()
            },
            final(callback) {
                callback()
            }
        })

        writer.pipe(duplexStream)
        values.forEach(q => writer.write(q))
        writer._flush((err) => { if (err) { console.error(err) } })
        writer.end()
        const readableStream = Readable.from(ttl)
        return guardStream(readableStream)
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

    private getDeltaIdentifier(fromIdentifier: ResourceIdentifier): ResourceIdentifier {
        return { path: fromIdentifier.path + ".vSolid" }
    }

    private getSparqlQuery(fromRequest: HttpRequest): String | null {
        let url = new URL("http://dummy" + fromRequest.url)
        const queryParams = url.searchParams
        return queryParams.get("query")
    }
}
