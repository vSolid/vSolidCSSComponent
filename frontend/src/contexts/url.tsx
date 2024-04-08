import { useResource } from "./resource";

export const useUrl = () => {
    const { url } = useResource()
    return { url }
}