import { getThingAll } from "@inrupt/solid-client";
import { useDataset } from "./dataset";

export function useThings() {
    const dataset = useDataset()
    const things = getThingAll(dataset)
    return things
}