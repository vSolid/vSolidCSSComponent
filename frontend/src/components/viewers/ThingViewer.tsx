import { Thing, getPropertyAll } from "@inrupt/solid-client";
import PredicateViewer from "./PredicateViewer";

interface Props {
    thing: Thing;
}

function ThingViewer({ thing }: Props) {
    const predicates = getPropertyAll(thing).map(predicate => <PredicateViewer thing={thing} predicate={predicate} />)

    return (
        <details>
            <summary><a href={thing.url}>{thing.url}</a></summary>
            {predicates}
        </details>
    )
}

export default ThingViewer