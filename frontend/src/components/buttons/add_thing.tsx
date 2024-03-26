import { SolidDataset, buildThing, createThing, saveSolidDatasetAt, setThing } from "@inrupt/solid-client"
import { fetch } from "@inrupt/solid-client-authn-browser"
import { SCHEMA_INRUPT } from "@inrupt/vocab-common-rdf"

interface Props {
    url: string
    dataset: SolidDataset
}

export function AddThingButton({ url, dataset }: Props) {
    async function addThing() {
        const name = prompt("You are about to create a new Thing. Please enter the the name of the it:")
        if (name) {
            const newBookThing1 = buildThing(createThing({ name: name }))
                .addStringNoLocale(SCHEMA_INRUPT.name, "ABC123 of Example Literature")
                .build()

            const newDataset = setThing(dataset, newBookThing1)
            saveSolidDatasetAt(url, newDataset, { fetch: fetch }).then(() => alert("Thing added!")).catch(alert)
        }
    }

    return (
        <button onClick={addThing}>New Thing</button>
    )
}