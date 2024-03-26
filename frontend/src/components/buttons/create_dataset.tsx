import { createSolidDataset, saveSolidDatasetAt } from "@inrupt/solid-client"
import { fetch } from "@inrupt/solid-client-authn-browser"

interface Props {
    url: string
}

export function CreateDatasetButton({ url }: Props) {
    async function createDataset() {
        const datasetURL = prompt("You are about to create a new dataset. Please provide the URL for it:", url)
        if (datasetURL) {
            const emptyDataset = createSolidDataset();
            saveSolidDatasetAt(datasetURL, emptyDataset, { fetch: fetch })
            .then(() => alert(`Empty dataset created at ${datasetURL}`))
            .catch(alert)
        }
    }

    return (
        <button onClick={createDataset}>Create Empty Dataset</button>
    )
}