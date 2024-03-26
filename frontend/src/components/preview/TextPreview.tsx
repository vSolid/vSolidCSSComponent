import { useEffect, useState } from "react";
import { useFile } from "../../hooks/file";

function TextPreview() {
    const file = useFile()
    const [content, setContent] = useState<string>();

    useEffect(() => {
        file.blob.text().then(setContent)
    }, [file])

    return (
        <p style={{ whiteSpace: "pre-line" }}>{content}</p>
    )
}

export default TextPreview