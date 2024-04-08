import { getContentType } from "@inrupt/solid-client";
import { useFile } from "../../hooks/file";
import ImagePreview from "../preview/ImagePreview";
import JsonPreview from "../preview/JsonPreview";
import TextPreview from "../preview/TextPreview";
import FieldSet from "../ui/FieldSet";

function FileViewer() {
    const file = useFile()
    const contentType = getContentType(file)

    let preview = <></>
    const contentTypeParts = contentType?.split("/") ?? ""
    if (contentTypeParts[0] === "text") {
        preview = <TextPreview/>
    } else if (contentTypeParts[0] === "image") {
        preview = <ImagePreview />
    } else if (contentType === "application/json") {
        preview = <JsonPreview />
    } else {
        preview = <p>Content type <b>{contentType}</b> is not supported</p>
    }

    return (
        <FieldSet header="File Viewer:">
            {preview}
        </FieldSet>
    )
}

export default FileViewer