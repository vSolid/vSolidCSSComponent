import { isRawData } from "@inrupt/solid-client"
import { SolidDataset, WithServerResourceInfo } from "@inrupt/solid-client/interfaces"
import { useResource } from "../contexts/resource"
import { DeleteResourceButton } from "./buttons/delete_resource"
import NotFound from "./ui/Error"
import FieldSet from "./ui/FieldSet"
import DatasetViewer from "./viewers/DatasetViewer"
import FileViewer from "./viewers/FileViewer"

export type Resource = (SolidDataset | FileData) & WithServerResourceInfo

export type FileData = WithServerResourceInfo & {
    blob: Blob;
}

function Explorer() {
    const { resource, error } = useResource()

    if (error) return <NotFound />

    if (!resource) return

    return (
        <div>
            {/* Structured Data (RDF Resource) */}
            {!isRawData(resource) && <DatasetViewer />}

            {/* Unstructured Data (Non-RDF Resource) */}
            {isRawData(resource) && <FileViewer />}

            <FieldSet header="Danger Zone:">
                <DeleteResourceButton />
            </FieldSet>
        </div>
    )
}

export default Explorer