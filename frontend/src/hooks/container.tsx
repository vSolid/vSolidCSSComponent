import { isContainer as _isContainer, getContainedResourceUrlAll } from "@inrupt/solid-client"
import { useDataset } from "./dataset"

export function useContainer() {
    const dataset = useDataset()
    const isContainer = _isContainer(dataset)
    const resources = isContainer ? getContainedResourceUrlAll(dataset) : []

    return { isContainer, resources }
}