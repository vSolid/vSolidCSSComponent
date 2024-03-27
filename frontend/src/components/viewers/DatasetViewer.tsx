import { isContainer } from "@inrupt/solid-client";
import { useUrl } from "../../contexts/url";
import { useDataset } from "../../hooks/dataset";
import ContainerViewer from "./ContainerViewer";
import ThingsViewer from "./ThingsViewer";
import TurtleViewer from "./TurtleViewer";

function DatasetViewer() {
    const dataset = useDataset()
    const { url } = useUrl()

    return (
        <>
            <h3>{isContainer(dataset) ? `CONTAINER:` : `THING:`} {url}</h3>

            <ContainerViewer />
            <ThingsViewer />
            <TurtleViewer />
        </>
    )
}

export default DatasetViewer