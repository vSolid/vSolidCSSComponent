import { isRawData, responseToResourceInfo, responseToSolidDataset } from "@inrupt/solid-client"
import { fetch } from "@inrupt/solid-client-authn-browser"
import { SolidDataset, WithServerResourceInfo } from "@inrupt/solid-client/interfaces"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { ResourceContext } from "../contexts/resource"
import { URLContext } from "../contexts/url"
import FieldSet from "./ui/FieldSet"
import DatasetViewer from "./viewers/DatasetViewer"
import FileViewer from "./viewers/FileViewer"

export type Resource = (SolidDataset | FileData) & WithServerResourceInfo

export type FileData = WithServerResourceInfo & {
    blob: Blob;
}

function Explorer() {
    const [resource, setResource] = useState<Resource>()
    const [search] = useSearchParams()
    const url = search.get('url')

    if (!url) return <></>

    async function fetchResource() {
        if (!url) return
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

    if (!resource) return <></>

    return (
        <ResourceContext.Provider value={{ resource, fetchResource }}>
            <URLContext.Provider value={{ url }}>
                <h2>Explorer</h2>
                <div>
                    {/* Structured Data (RDF Resource) */}
                    {!isRawData(resource) && <DatasetViewer />}

                    {/* Unstructured Data (Non-RDF Resource) */}
                    {isRawData(resource) && <FileViewer />}

                    <FieldSet header="Danger Zone:">
                        <></>
                        {/*<DeleteResourceButton/>*/}
                    </FieldSet>
                </div>
            </URLContext.Provider>
        </ResourceContext.Provider>
    )
}

export default Explorer