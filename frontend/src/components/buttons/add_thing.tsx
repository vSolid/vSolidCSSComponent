import { SolidDataset, buildThing, createThing, saveSolidDatasetAt, setThing } from "@inrupt/solid-client"
import { RDF, SCHEMA_INRUPT } from "@inrupt/vocab-common-rdf"
import { fetch } from "@inrupt/solid-client-authn-browser"

interface Props {
    url: string
    dataset: SolidDataset
}

export function AddThingButton({ url, dataset }: Props) {
    async function addThing() {
        const name = prompt("Specify name for thing (this will create a prebuild thing):")
        if (name) {
            const newBookThing1 = buildThing(createThing({ name: name }))
                .addStringNoLocale(SCHEMA_INRUPT.name, "ABC123 of Example Literature")
                .addUrl(RDF.type, "https://schema.org/Book")
                .build()

            const newDataset = setThing(dataset, newBookThing1)
            saveSolidDatasetAt(url, newDataset, { fetch: fetch }).then(() => alert("Thing added!")).catch(alert)
        }
    }

    return (
        <button onClick={addThing}>Add Thing</button>
    )
}