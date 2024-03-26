import ContainerViewer from "./ContainerViewer";
import ThingsViewer from "./ThingsViewer";

function DatasetViewer() {       
    return (
        <>
            {/*<FieldSet header="Actions:">
                <CreateContainerButton url={url} />
                <CreateDatasetButton url={url} />
                <AddThingButton url={url} dataset={dataset} />
            </FieldSet>*/}

            <ContainerViewer />
            <ThingsViewer />
        </>
    )
}

export default DatasetViewer