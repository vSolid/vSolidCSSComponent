import { SolidDataset, Thing, buildThing, saveSolidDatasetAt, setThing } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";

interface Props {
    url: string
    thing: Thing
    dataset: SolidDataset
}

export function NewPropertyButton({ url, thing, dataset }: Props) {
    function newProperty() {
        const predicate = prompt("You are about to create a new property for a Thing. Please specify the predicate URL:")
        if (predicate) {
            const updatedThing = buildThing(thing).addStringNoLocale(predicate, "ABC123 of Example Literature").build()
            
            const newDataset = setThing(dataset, updatedThing)
            saveSolidDatasetAt(url, newDataset, { fetch: fetch }).then(() => alert("Thing added!")).catch(alert)
        }
    }

    return (
        <button onClick={newProperty}>New property</button>
    )
}