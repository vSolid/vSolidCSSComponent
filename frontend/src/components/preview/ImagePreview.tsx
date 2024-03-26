import { useFile } from "../../hooks/file"

function ImagePreview() {
    const file = useFile()
    
    return (
        <img
            src={URL.createObjectURL(file.blob)}
            className="mx-auto"
        />
    )
}

export default ImagePreview