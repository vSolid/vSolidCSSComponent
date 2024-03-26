import { createContext, useContext } from "react";
import { Resource } from "../components/Explorer";

interface ResourceContextType {
    resource: Resource
    fetchResource: () => void 
}

export const ResourceContext = createContext<ResourceContextType | null>(null)

export const useResource = () => {
    const context = useContext(ResourceContext)

    if (!context) {
        throw new Error("useResource must be used inside the ResourceContext");
    }

    return context
}