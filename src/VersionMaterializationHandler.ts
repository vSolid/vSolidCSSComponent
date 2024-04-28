import { NotImplementedHttpError, OkResponseDescription, OperationHttpHandlerInput, PostOperationHandler, Representation, RepresentationMetadata, ResourceStore, ResponseDescription, endOfStream, serializeQuads } from "@solid/community-server";
import { DataFactory, Quad, Store } from "n3";
import rdfParser from 'rdf-parse';
import { APPLICATION_SPARQL_VERSION_MATERIALIZATION } from "./utils/ContentTypes";
import { getDeltaIdentifier } from "./utils/DeltaUtil";
import { readableToQuads } from "./utils/QuadUtil";
import { getQueryParameter } from "./utils/QueryUtil";
import { VS } from "./utils/VS";

/**
 * Handles Version Materialization for archiving.
 */
export class VersionMaterializationHandler extends PostOperationHandler {
    private readonly _store: ResourceStore

    public constructor(store: ResourceStore) {
        super(store)
        this._store = store
    }

    public async canHandle({ request }: OperationHttpHandlerInput): Promise<void> {
        if (request.headers['content-type'] != APPLICATION_SPARQL_VERSION_MATERIALIZATION) {
            throw new NotImplementedHttpError('This handler only supports version materialization operations');
        }
    }

    public async handle({ request, operation }: OperationHttpHandlerInput): Promise<ResponseDescription> {
        let materializedID = getQueryParameter(request.url, "delta_id")

        let currentRepresentationIdentifier = operation.target
        let deltaRepresentationIdentifier = getDeltaIdentifier(currentRepresentationIdentifier)

        let currentRepresentation = await this._store.getRepresentation(currentRepresentationIdentifier, {})
        let deltaRepresentation = await this._store.getRepresentation(deltaRepresentationIdentifier, {})

        let materializedQuads = await this.materialize(currentRepresentation, deltaRepresentation, currentRepresentationIdentifier.path, materializedID)

        return new OkResponseDescription(new RepresentationMetadata(), serializeQuads(materializedQuads))
    }

    async materialize(currentRepresentation: Representation, deltaRepresentation: Representation, currentRepresentationIdentifier: string, materializedID: string): Promise<Quad[]> {
        var nextDelta = currentRepresentation.metadata.get(DataFactory.namedNode(VS.next_delta))?.value

        if (!nextDelta) {
            throw new Error("No deltas have been saved for this resource.")
        }

        const rawQuads = rdfParser.parse(currentRepresentation.data, {
            contentType: currentRepresentation.metadata.contentType!,
            baseIRI: currentRepresentationIdentifier
        })

        const materializedStore = new Store();
        materializedStore.import(rawQuads);
        await endOfStream(rawQuads);

        let deltaStore = await readableToQuads(deltaRepresentation.data)

        while (nextDelta && nextDelta != materializedID) {
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

        return materializedStore.getQuads(null, null, null, null)
    }

    private operations(store: Store, deltaIdentifier: string): Quad[] {
        return store.getQuads(DataFactory.namedNode(deltaIdentifier), DataFactory.namedNode(VS.contains_operation), null, null)
    }

    private nextDelta(store: Store, deltaIdentifier: string): Quad | undefined {
        return store.getQuads(DataFactory.namedNode(deltaIdentifier), DataFactory.namedNode(VS.next_delta), null, null)[0]
    }
}