import { isRawData, responseToResourceInfo, responseToSolidDataset } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Resource } from "../components/Explorer";

interface ResourceContextType {
    resource: Resource | undefined
    fetchResource: () => void 
    url: string | null
    error: ResourceError | null
}

type ResourceError = {
    code: number;
    message: string;
}

export const ResourceContext = createContext<ResourceContextType | null>(null)

export function ResourceProvider({ children }: { children: ReactNode }) {
    const [resource, setResource] = useState<Resource>()
    const [error, setError] = useState<ResourceError | null>(null)
    const navigate = useNavigate()
    const [search] = useSearchParams()
    const url = search.get('url')

    async function fetchResource() {
        if (!url) return
        const response = await fetch(url)
        if ((response.status === 404 || response.status === 403) && !url.endsWith('/')) {
            navigate(`/explore/?url=${encodeURIComponent(url + '/')}`)
            return
        } else if (!response.ok) {
            setError({
                code: response.status,
                message: response.statusText
            })
            return
        }

        setError(null)

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

    return (
        <ResourceContext.Provider value={{ resource, fetchResource, url, error }}>
            {children}
        </ResourceContext.Provider>
    )
}

export const useResource = () => {
    const context = useContext(ResourceContext)

    if (!context) {
        throw new Error("useResource must be used inside the ResourceContext");
    }

    return context
}