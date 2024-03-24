import { SolidDataset, WithServerResourceInfo, isRawData, responseToResourceInfo, responseToSolidDataset } from "@inrupt/solid-client"
import { fetch } from "@inrupt/solid-client-authn-browser"
import { useEffect, useState } from "react"
import { isContainer as solidIsContainer } from "@inrupt/solid-client"

export type FileData = WithServerResourceInfo & {
    blob: Blob
}

export function isFileData(resource: Resource): resource is FileData {
    return (resource as FileData).blob ? true : false
}

export function isContainer(resource: Resource): resource is (SolidDataset & WithServerResourceInfo) {
    return solidIsContainer(resource)
}

export type Resource = FileData | (SolidDataset & WithServerResourceInfo)

export function useResource(url: string) {
    const [resource, setResource] = useState<Resource>()

    async function fetchResource() {
        const response = await fetch(url)
        const resourceInfo = responseToResourceInfo(response)

        if (isRawData(resourceInfo)) {
            // Unstructured Data (Non-RDF Resource)
            setResource({
                ...resourceInfo,
                blob: await response.blob()
            })
        } else {
            // Structured Data (RDF Resource)
            setResource(await responseToSolidDataset(response))
        }
    }

    useEffect(() => {
        fetchResource()
    }, [url])

    return resource
}