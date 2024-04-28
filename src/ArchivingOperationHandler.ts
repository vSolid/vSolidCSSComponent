import { QueryEngine } from '@comunica/query-sparql'
import { OkResponseDescription, Operation, OperationHttpHandlerInput, PostOperationHandler, RepresentationMetadata, ResourceIdentifier, ResourceStore, ResponseDescription, endOfStream, readableToString, serializeQuads } from "@solid/community-server"
import { DataFactory, Quad, Store } from "n3"
import rdfParser from 'rdf-parse'
import { VS } from "./ArchivingDataAccessorBasedStore"
import { getDeltaIdentifier } from "./utils/deltaIdentifier"
import { readableToQuads } from "./utils/quads"
import { getQueryParameter } from './utils/query'

export class ArchivingOperationHandler extends PostOperationHandler {
    private readonly _store: ResourceStore
    private readonly engine

    public constructor(store: ResourceStore) {
        super(store)
        this._store = store
        this.engine = new QueryEngine()
    }

    public async handle({ request, operation }: OperationHttpHandlerInput): Promise<ResponseDescription> {
        if (request.headers["content-type"] == "application/sparql-archiving") {
            return await this.handleSparqlQuery(operation)
        } else if (request.headers["content-type"] == "application/sparql-vm") {
            let materialization_delta_id = getQueryParameter(request.url, "delta_id")

            let identifier = operation.target
            let delta_identifier = getDeltaIdentifier(identifier)
            return await this.handleVersionMaterialization(identifier, delta_identifier, materialization_delta_id)
        } else {
            return await super.handle({ operation })
        }
    }

    private async handleSparqlQuery(operation: Operation): Promise<ResponseDescription> {
        let identifier = operation.target
        let delta_identifier = getDeltaIdentifier(identifier)

        let representation = await this._store.getRepresentation(delta_identifier, operation.preferences, operation.conditions)

        let store = await readableToQuads(representation.data)

        const sparql = await readableToString(operation.body.data)
        const quadStream = await this.engine.queryQuads(sparql, { sources: [store], baseIRI: delta_identifier.path })

        const quads = await quadStream.toArray()

        return new OkResponseDescription(new RepresentationMetadata(), serializeQuads(quads))
    }

    private async handleVersionMaterialization(identifier: ResourceIdentifier, deltaIdentifier: ResourceIdentifier, versionID: string): Promise<ResponseDescription> {
        let currentRepresentation = await this._store.getRepresentation(identifier, {})
        let deltaRepresentation = await this._store.getRepresentation(deltaIdentifier, {})

        var nextDelta = currentRepresentation.metadata.get(DataFactory.namedNode(VS.next_delta))?.value

        if (!nextDelta) {
            throw new Error("No deltas have been saved for this resource.")
        }

        // This adds the identifier.path to all subjects (the .ttl and .vSolid contains respectively without and with the identifier)
        const rawQuads = rdfParser.parse(currentRepresentation.data, {
            contentType: currentRepresentation.metadata.contentType!,
            baseIRI: identifier.path
        })

        const materializedStore = new Store();
        materializedStore.import(rawQuads);
        await endOfStream(rawQuads);

        let deltaStore = await readableToQuads(deltaRepresentation.data)

        while (nextDelta && nextDelta != versionID) {
            let operations = this.operations(deltaStore, nextDelta)
            operations.forEach(quad => {
                let operation = (quad.object as unknown) as Quad
                let change = (operation.subject as unknown) as Quad
                switch (operation.object.value) {
                    case VS.insert:
                        materializedStore.removeQuad(change.subject, change.predicate, change.object)
                        break
                    case VS.delete:
                        materializedStore.addQuad(change.subject, change.predicate, change.object)
                        break
                }
            })

            nextDelta = this.nextDelta(deltaStore, nextDelta)?.object.value
        }

        return new OkResponseDescription(new RepresentationMetadata(), serializeQuads(materializedStore.getQuads(null, null, null, null)))
    }

    private operations(store: Store, deltaIdentifier: string): Quad[] {
        return store.getQuads(DataFactory.namedNode(deltaIdentifier), DataFactory.namedNode(VS.contains_operation), null, null)
    }

    private nextDelta(store: Store, deltaIdentifier: string): Quad | undefined {
        return store.getQuads(DataFactory.namedNode(deltaIdentifier), DataFactory.namedNode(VS.next_delta), null, null)[0]
    }
}
