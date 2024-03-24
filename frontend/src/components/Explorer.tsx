import { useDataset } from "../hooks/datasets"
import ContainerViewer from "./viewers/ContainerViewer"
import FileViewer from "./viewers/FileViewer"
import ThingsViewer from "./viewers/ThingsViewer"

interface Props {
    url: string
}

function Explorer({ url }: Props) {
    const dataset = useDataset(url)

    if (!dataset) return <></>

    return (
        <>
            <h2>Explorer</h2>
            <div>
                <FileViewer fileURL={url} />
                <ContainerViewer dataset={dataset} />
                <ThingsViewer dataset={dataset} />
            </div>
        </>
    )
}

export default Explorer