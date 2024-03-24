import { useEffect, useState } from "react"
import { FileData } from "../../hooks/resource"

interface Props {
    file: FileData
}

function TextPreview({ file }: Props) {
    const [content, setContent] = useState<string>();

    useEffect(() => {
        file.blob.text().then(setContent)
    }, [file])

    return (
        <>{content}</>
    )
}

export default TextPreview