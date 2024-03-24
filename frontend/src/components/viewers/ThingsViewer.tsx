import { SolidDataset, getThingAll } from "@inrupt/solid-client";
import FieldSet from "../ui/FieldSet";
import ThingViewer from "./ThingViewer";

interface Props {
    dataset: SolidDataset;
}

function ThingsViewer({ dataset }: Props) {
    const things = getThingAll(dataset).map(thing => <ThingViewer thing={thing} />)

    return (
        <>
            <FieldSet header="Things:">
                {things}
            </FieldSet>
        </>
    )
}

export default ThingsViewer