import { WithServerResourceInfo, getContentType, isRawData, responseToResourceInfo } from "@inrupt/solid-client";
import { useEffect, useState } from "react";
import FieldSet from "../ui/FieldSet";
import { fetch } from "@inrupt/solid-client-authn-browser";
import MarkdownPreview from "../preview/MarkdownPreview";

interface Props {
    fileURL: string
}

function FileViewer({ fileURL }: Props) {
    const [resourceInfo, setResourceInfo] = useState<WithServerResourceInfo>()

    async function readFileFromPod(fileURL: string) {
        const response = await fetch(fileURL);
        setResourceInfo(responseToResourceInfo(response))
    }

    useEffect(() => {
        readFileFromPod(fileURL)
    }, [fileURL])

    if (!resourceInfo) return <></>
    if (!isRawData(resourceInfo)) return <></>
    const contentType = getContentType(resourceInfo)

    let preview = <></>
    switch(contentType) {
        case "text/markdown":
            preview = <MarkdownPreview />
            break
    }

    return (
        <FieldSet header="File Viewer:">
            <p>{contentType}</p>
            {preview}
        </FieldSet>
    )
}

export default FileViewer