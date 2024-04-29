import { ArchivesViewer } from "./ArchivesViewer";
import ContainerViewer from "./ContainerViewer";
import ThingsViewer from "./ThingsViewer";
import TurtleViewer from "./TurtleViewer";

function DatasetViewer() {
    return (
        <>
            <ContainerViewer />
            <ThingsViewer />
            <TurtleViewer />
            <ArchivesViewer />
        </>
    )
}

export default DatasetViewer