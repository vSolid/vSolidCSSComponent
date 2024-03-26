import { isRawData, responseToResourceInfo, responseToSolidDataset } from "@inrupt/solid-client"
import { fetch } from "@inrupt/solid-client-authn-browser"
import { Resource, WithResourceInfo } from "@inrupt/solid-client/interfaces"
import { useEffect, useState } from "react"

export function useResource(url: string) {
    const [resource, setResource] = useState<Resource & WithResourceInfo>()

    async function fetchResource() {
        const response = await fetch(url)
        const resourceInfo = responseToResourceInfo(response)

        if (isRawData(resourceInfo)) {
            // Unstructured Data (Non-RDF Resource)
            setResource({
                ...resourceInfo,
                ...await response.blob()
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