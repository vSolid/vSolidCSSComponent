import { Thing } from "@inrupt/solid-client";
import { createContext, useContext } from "react";

interface ThingContextType {
    thing: Thing
    update: (updatedThing: Thing) => void
}

export const ThingContext = createContext<ThingContextType | null>(null)

export const useThing = () => {
    const context = useContext(ThingContext)

    if (!context) {
        throw new Error("useThing must be used inside the ThingContext");
    }

    return context
}