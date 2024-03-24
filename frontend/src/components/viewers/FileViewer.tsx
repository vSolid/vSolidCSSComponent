import { getContentType } from "@inrupt/solid-client";
import FieldSet from "../ui/FieldSet";
import { FileData } from "../../hooks/resource";
import ImagePreview from "../preview/ImagePreview";
import TextPreview from "../preview/TextPreview";
import JsonPreview from "../preview/JsonPreview";

interface Props {
    file: FileData
}

function FileViewer({ file }: Props) {
    const contentType = getContentType(file)

    let preview = <></>
    const contentTypeParts = contentType?.split("/") ?? ""
    if (contentTypeParts[0] === "text") {
        preview = <TextPreview file={file} />
    } else if (contentTypeParts[0] === "image") {
        preview = <ImagePreview file={file} />
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