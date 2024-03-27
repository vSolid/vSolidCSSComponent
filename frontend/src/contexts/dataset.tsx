import { SolidDataset } from "@inrupt/solid-client";
import { createContext, useContext } from "react";

interface DatasetContextType {
    dataset: SolidDataset
    update: (newDataset: SolidDataset) => void
}

export const DatasetContext = createContext<DatasetContextType | null>(null)

export const useDataset = () => {
    const context = useContext(DatasetContext)

    if (!context) {
        throw new Error("useDataset must be used inside the DatasetContext");
    }

    return context
}