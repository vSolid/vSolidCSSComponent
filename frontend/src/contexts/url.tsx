import { createContext, useContext } from "react";

interface URLContentType {
    url: string
}

export const URLContext = createContext<URLContentType | null>(null)

export const useUrl = () => {
    const context = useContext(URLContext)

    if (!context) {
        throw new Error("useUrl must be used inside the URLContext");
    }

    return context
}