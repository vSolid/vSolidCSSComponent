import { SolidDataset, WithResourceInfo } from "@inrupt/solid-client";
import { useResource } from "../contexts/resource";

export function useDataset() {
    const { resource } = useResource()

    return resource as SolidDataset & WithResourceInfo
}