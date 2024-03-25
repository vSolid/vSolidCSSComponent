import { isContainer, isFileData, useResource } from "../hooks/resource"
import ContainerViewer from "./viewers/ContainerViewer"
import FileViewer from "./viewers/FileViewer"
import ThingsViewer from "./viewers/ThingsViewer"
import TurtleViewer from "./viewers/TurtleViewer"
import FieldSet from "./ui/FieldSet"
import { CreateContainerButton } from "./buttons/create_container"

interface Props {
    url: string
}

function Explorer({ url }: Props) {
    const resource = useResource(url)

    if (!resource) return <p>No resource found!</p>

    const fileViewer = isFileData(resource) ? <FileViewer file={resource} /> : <></>

    const containerViewer = isContainer(resource) ? <ContainerViewer dataset={resource} /> : <></>
    const thingsViewer = isContainer(resource) ? <ThingsViewer dataset={resource} /> : <></>
    const turtleViewer = isContainer(resource) ? <TurtleViewer dataset={resource} /> : <></>

    return (
        <>
            <FieldSet header="Actions:">
                <FieldSet header="Create Container:">
                    <CreateContainerButton url={url} />
                </FieldSet>
            </FieldSet>

            <h2>Explorer</h2>
            <div>
                {fileViewer}
                {containerViewer}
                {thingsViewer}
                {turtleViewer}
            </div>
        </>
    )
}

export default Explorer