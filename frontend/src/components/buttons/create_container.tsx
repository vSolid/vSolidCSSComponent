import { createContainerAt, getSourceIri } from "@inrupt/solid-client"
import React, { useEffect, useState } from "react"
import { fetch } from "@inrupt/solid-client-authn-browser"
import { useNavigate } from "react-router-dom";

interface Props {
    url: string | undefined
}

export function CreateContainerButton({ url = "" }: Props) {
    const [containerUrl, setContainerUrl] = useState(url);
    const navigate = useNavigate()

    useEffect(() => {
        setContainerUrl(url)
    }, [url])

    async function createContainer(e: React.FormEvent) {
        e.preventDefault()
        e.stopPropagation()

        createContainerAt(containerUrl, { fetch: fetch })
        .then(dataset => { 
            navigate(`/explore/?url=${encodeURIComponent(getSourceIri(dataset))}`)
        })
        .catch(alert)
    }

    return (
        <form onSubmit={createContainer}>
            <label htmlFor="container_url">Container URL: </label>
            <input style={{ width: "250px" }} placeholder="The new URL for the container" id="container_url" name="container_url" value={containerUrl} onChange={(e) => setContainerUrl(e.target.value)} />
            <input type="submit" value="Create" />
            <legend>This will create an empty container at the given URL.</legend>
        </form>
    )
}