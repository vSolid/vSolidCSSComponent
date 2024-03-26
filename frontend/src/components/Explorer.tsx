import { useResource } from "../hooks/resource"
import ContainerViewer from "./viewers/ContainerViewer"
import FileViewer from "./viewers/FileViewer"
import ThingsViewer from "./viewers/ThingsViewer"
import TurtleViewer from "./viewers/TurtleViewer"
import { CreateContainerButton } from "./buttons/create_container"
import FieldSet from "./ui/FieldSet"
import { DeleteResourceButton } from "./buttons/delete_resource"
import { CreateDatasetButton } from "./buttons/create_dataset"
import { File, Resource, SolidDataset, WithResourceInfo } from "@inrupt/solid-client/interfaces"
import { isRawData, isContainer as solidIsContainer } from "@inrupt/solid-client"
import { AddThingButton } from "./buttons/add_thing"

interface Props {
    url: string
}

function isDataset(resource: Resource): resource is SolidDataset {
    return resource.type == "Dataset"
}

function isContainer(resource: Resource & WithResourceInfo): resource is SolidDataset & WithResourceInfo {
    return solidIsContainer(resource)
}

function isFileData(resource: Resource & WithResourceInfo): resource is File & WithResourceInfo {
    return isRawData(resource)
}

function Explorer({ url }: Props) {
    const resource = useResource(url)

    if (!resource) return <p>No resource found!</p>

    const fileViewer = isFileData(resource) ? <FileViewer file={resource} /> : <></>
    const containerViewer = isContainer(resource) ? <ContainerViewer dataset={resource} /> : <></>
    const thingsViewer = isDataset(resource) ? <ThingsViewer dataset={resource} /> : <></>
    const turtleViewer = isContainer(resource) ? <TurtleViewer dataset={resource} /> : <></>

    return (
        <>
            <h2>Explorer</h2>
            <div>
                <FieldSet header="Actions:">
                    <CreateContainerButton url={url} />
                    <CreateDatasetButton url={url} />
                    {isDataset(resource) ? <AddThingButton url={url} dataset={resource} /> : <></>}
                </FieldSet>

                {fileViewer}
                {containerViewer}
                {thingsViewer}
                {turtleViewer}

                <FieldSet header="Danger Zone:">
                    <DeleteResourceButton resource={resource} />
                </FieldSet>
            </div>
        </>
    )
}

export default Explorer