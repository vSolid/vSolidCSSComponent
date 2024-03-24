import { isContainer, isFileData, useResource } from "../hooks/resource"
import ContainerViewer from "./viewers/ContainerViewer"
import FileViewer from "./viewers/FileViewer"
import ThingsViewer from "./viewers/ThingsViewer"

interface Props {
    url: string
}

function Explorer({ url }: Props) {
    const resource = useResource(url)
    
    if (!resource) return <p>No resource found!</p>

    const fileViewer = isFileData(resource) ? <FileViewer file={resource} /> : <></>

    const containerViewer = isContainer(resource) ? <ContainerViewer dataset={resource} /> : <></>
    const thingsViewer = isContainer(resource) ? <ThingsViewer dataset={resource} /> : <></>

    return (
        <>
            <h2>Explorer</h2>
            <div>
                {fileViewer}
                {containerViewer}
                {thingsViewer}
            </div>
        </>
    )
}

export default Explorer