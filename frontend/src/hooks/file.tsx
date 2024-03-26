import { FileData } from "../components/Explorer"
import { useResource } from "../contexts/resource"

export function useFile() {
    const { resource } = useResource()

    return resource as FileData
}