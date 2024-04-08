import { Thing, getPropertyAll, removeThing, saveSolidDatasetAt } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { useResource } from "../../contexts/resource";
import { useUrl } from "../../contexts/url";
import { useDataset } from "../../hooks/dataset";
import PredicateViewer from "./PredicateViewer";

interface Props {
    thing: Thing
}

function ThingViewer({ thing }: Props) {
    const predicates = getPropertyAll(thing).map((predicate, key) => <PredicateViewer key={key} thing={thing} predicate={predicate} />)

    const dataset = useDataset()
    const { url } = useUrl()
    const { fetchResource } = useResource()

    function deleteThing() {
        if (!url) return
        const confirmed = confirm(`Are you sure you would like to delete the thing: ${thing.url}`)
        if (!confirmed) return

        const removed = removeThing(dataset, thing)
        saveSolidDatasetAt(url, removed, { fetch: fetch }).then(fetchResource).catch(alert)
    }

    return (
        <details>
            <summary>{thing.url} <a href="#" onClick={deleteThing}>delete</a></summary>
            {predicates}
        </details>
    )
}

export default ThingViewer