import { useEffect, useState } from "react";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { getSolidDataset } from "@inrupt/solid-client";

export function useDataset(url: string) {
    const [dataset, setDataset] = useState<any>()
    
    useEffect(() => {
        getSolidDataset(url, { fetch: fetch }).then(setDataset)
    }, [url])

    return dataset
}