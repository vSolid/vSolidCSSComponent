import { useEffect, useState } from "react"
import { FileData } from "../../hooks/resource"

interface Props {
    file: FileData
}

function ImagePreview({ file }: Props) {
    return (
        <img
            src={URL.createObjectURL(file.blob)}
            className="mx-auto"
          />
    )
}

export default ImagePreview