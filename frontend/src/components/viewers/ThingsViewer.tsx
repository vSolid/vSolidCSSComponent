import { buildThing, createThing, isContainer, saveSolidDatasetAt, setThing } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { RDF, SCHEMA_INRUPT } from "@inrupt/vocab-common-rdf";
import { useResource } from "../../contexts/resource";
import { useUrl } from "../../contexts/url";
import { useDataset } from "../../hooks/dataset";
import { useThings } from "../../hooks/things";
import FieldSet from "../ui/FieldSet";
import ThingViewer from "./ThingViewer";

function ThingsViewer() {
    const things = useThings()
    const { fetchResource } = useResource()
    const dataset = useDataset()
    const { url } = useUrl()

    async function addThing() {
        const name = prompt("You are about to create a new Thing. Please provide URL for it.")
        if (name) {
            const newBookThing1 = buildThing(createThing({ name: name }))
                .addStringNoLocale(SCHEMA_INRUPT.name, "ABC123 of Example Literature")
                .addUrl(RDF.type, "https://schema.org/Book")
                .build()

            const newDataset = setThing(dataset, newBookThing1)
            const thingUrl = isContainer(dataset) ? url + name : url + "#" + name
            saveSolidDatasetAt(thingUrl, newDataset, { fetch: fetch }).then(fetchResource).then(() => alert("Thing added!")).catch(alert)
        }
    }

    return (
        <>
            <FieldSet header="Things:">
                {things.map((thing, i) => <ThingViewer key={i} thing={thing} />)}

                <button onClick={addThing}>Add Thing</button>
            </FieldSet>
        </>
    )
}

export default ThingsViewer