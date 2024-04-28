import { Guarded, INTERNAL_QUADS, OkResponseDescription, Operation, OperationHttpHandlerInput, PostOperationHandler, QuadToRdfConverter, Representation, RepresentationMetadata, ResourceIdentifier, ResourceStore, ResponseDescription, endOfStream, getConversionTarget, guardStream, guardedStreamFrom, pipeSafely, readableToQuads, readableToString, serializeQuads } from "@solid/community-server"
import { QueryEngine } from '@comunica/query-sparql'
import { Duplex, Readable } from "stream"
import { Store, Parser, StreamWriter, DataFactory, Quad } from "n3"
import { VS } from "./ArchivingDataAccessorBasedStore"
import arrayifyStream from 'arrayify-stream'
import type { Bindings } from '@rdfjs/types'
import rdfParser from 'rdf-parse'
import rdfSerializer from 'rdf-serialize'

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
        } else if (request.headers["content-type"] == "application/sparql-vm") {
            const url = new URL("http://dummy" + request.url);
            const queryParams = url.searchParams;
            let materialization_delta_id = queryParams.get("delta_id")
            console.log(materialization_delta_id)
            if (!materialization_delta_id) {
                throw new Error(`Query delta_id not included`)
            }

            let identifier = operation.target
            let delta_identifier = this.getDeltaIdentifier(identifier)
            return await this.handleVersionMaterialization(identifier, delta_identifier, materialization_delta_id)
        } else {
            return await super.handle({ operation })
        }
    }

    private async handleQuery(operation: Operation): Promise<ResponseDescription> {
        let identifier = operation.target
        let delta_identifier = this.getDeltaIdentifier(identifier)

        let representation = await this._store.getRepresentation(delta_identifier, operation.preferences, operation.conditions)

        let store = await this.readableToQuads(representation.data)

        const sparql = await readableToString(operation.body.data)
        const quadStream = await this.engine.queryQuads(sparql, { sources: [store], baseIRI: delta_identifier.path })
        const quads = await quadStream.toArray()

        return new OkResponseDescription(new RepresentationMetadata(), serializeQuads(quads))
    }

    private async handleVersionMaterialization(identifier: ResourceIdentifier, deltaIdentifier: ResourceIdentifier, versionID: string): Promise<ResponseDescription> {
        let newestRepresentation = await this._store.getRepresentation(identifier, {})
        let deltaRepresentation = await this._store.getRepresentation(deltaIdentifier, {})

        let metadata = newestRepresentation.metadata
        var nextDelta = metadata.get(DataFactory.namedNode(VS.next_delta))?.value

        if (!nextDelta) {
            throw new Error("No deltas have been saved for this resource.")
        }
 
        const rawQuads = rdfParser.parse(newestRepresentation.data, {
            contentType: newestRepresentation.metadata.contentType!,
            baseIRI: identifier.path            
        })

        const store = new Store();
        store.import(rawQuads);
        await endOfStream(rawQuads);

        //let store = await this.readableToQuads(newestRepresentation.data)
        let deltaStore = await this.readableToQuads(deltaRepresentation.data)

        while (nextDelta && nextDelta != versionID) {
            let operations = this.operations(deltaStore, nextDelta)
            operations.forEach(quad => {
                let operation = (quad.object as unknown) as Quad
                let change = (operation.subject as unknown) as Quad
                switch (operation.object.value) {
                    case VS.insert:
                        console.log(change.subject, change.predicate, change.object)
                        store.removeQuad(change.subject, change.predicate, change.object)
                        break
                    case VS.delete:
                        store.addQuad(change.subject, change.predicate, change.object)
                        break
                }
            })

            nextDelta = this.nextDelta(deltaStore, nextDelta)?.object.value
        }

        return new OkResponseDescription(new RepresentationMetadata(), serializeQuads(store.getQuads(null, null, null, null)))
    }

    private operations(store: Store, deltaIdentifier: string): Quad[] {
        return store.getQuads(DataFactory.namedNode(deltaIdentifier), DataFactory.namedNode(VS.contains_operation), null, null)
    }

    private nextDelta(store: Store, deltaIdentifier: string): Quad | undefined {
        return store.getQuads(DataFactory.namedNode(deltaIdentifier), DataFactory.namedNode(VS.next_delta), null, null)[0]
    }

    private async readableToQuads(stream: Readable): Promise<Store> {
        let str = await readableToString(stream)
        const parser = new Parser()
        let existingQuads = parser.parse(str)
        let store = new Store()
        store.addQuads(existingQuads)
        return store
    }

    private getDeltaIdentifier(fromIdentifier: ResourceIdentifier): ResourceIdentifier {
        return { path: fromIdentifier.path + ".vSolid" }
    }
}
