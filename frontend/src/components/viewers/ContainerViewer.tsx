import { createContainerAt, createContainerInContainer, createSolidDataset, saveSolidDatasetAt } from "@inrupt/solid-client"
import { fetch } from "@inrupt/solid-client-authn-browser"
import { Link } from "react-router-dom"
import { useResource } from "../../contexts/resource"
import { useUrl } from "../../contexts/url"
import { useContainer } from "../../hooks/container"
import FieldSet from "../ui/FieldSet"

function ContainerViewer() {
    const { isContainer, resources } = useContainer()
    const { fetchResource } = useResource()

    const { url } = useUrl()

    async function addContainer() {
        const name = prompt(`You are about to create a container. Provide a name for the container for which a new container will be created at ${url}<name>/. If you do not provide a name a random container will be created.`)

        if (name == null) return

        if (name) {
            await createContainerAt(url + name, { fetch: fetch })
        } else {
            await createContainerInContainer("http://localhost:3000/sebs", { fetch: fetch })
        }
        fetchResource()
    }

    async function addResource() {
        const name = prompt(`You are about to create a resource. Provide a name for the resource for which will be created at ${url}<name>.`)

        if (name == null) return

        if (name) {
            await saveSolidDatasetAt(url + name, createSolidDataset(), { fetch: fetch, })
            fetchResource()
        }
    }

    if (!isContainer) return <></>

    return (<>
        <FieldSet header="Contained Resources:">
            {resources.map(url => (
                <li key={url}>
                    <Link to={`/explore/?url=${encodeURIComponent(url)}`}>{url}</Link>
                </li>
            ))}

            <button onClick={addContainer}>Add Container</button>
            <button onClick={addResource}>Add Resource</button>
        </FieldSet>
    </>)
}

export default ContainerViewer