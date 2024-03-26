import { useEffect, useState } from "react"
import { FileData } from "../../hooks/resource";

interface Props {
    file: FileData
}

function TextPreview({ file }: Props) {
    const [content, setContent] = useState<string>();

    useEffect(() => {
        console.log(file)
        //file.text().then(setContent)
    }, [file])

    return (
        <p>N/A</p>
    )
}

export default TextPreview