import { createContainerAt } from "@inrupt/solid-client"
import { fetch } from "@inrupt/solid-client-authn-browser"

interface Props {
    url: string | undefined
}

export function CreateContainerButton({ url }: Props) {
    function onClick() {
        const containerURL = prompt("You are about to create a new container. Please enter the URL for it:", url)

        if (containerURL) {
            createContainerAt(containerURL, { fetch: fetch })
            .catch(alert)
        }
    }

    return (
        <button onClick={onClick}>Create Container</button>
    )
}