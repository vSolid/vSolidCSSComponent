import { SolidDataset, getThingAll, responseToSolidDataset } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { useState } from "react";
import { useUrl } from "../../contexts/url";
import ThingsViewer from "./ThingsViewer";

export function ArchiveViewer({ archiveID, date }: { archiveID: string, date: Date }) {
    const [dataset, setDataset] = useState<SolidDataset | null>()
    const { url } = useUrl()

    async function fetchArchive() {
        if (!url) return
        console.log(archiveID)
        const res = await fetch(`${url}?delta_id=${archiveID}`, {
            headers: {
                "Content-Type": "application/version-materialization"
            }
        })

        if (res.ok) {
            setDataset(await responseToSolidDataset(res))
        }
    }

    return (
        <details onClick={fetchArchive}>
            <summary>{date.toLocaleString()} ({archiveID})</summary>
            {dataset ? (
                <ThingsViewer things={getThingAll(dataset)} disableDeleting disableEditing hideAddThingButton />
            ) : (
                <p>Loading...</p>
            )}
        </details>
    )
}