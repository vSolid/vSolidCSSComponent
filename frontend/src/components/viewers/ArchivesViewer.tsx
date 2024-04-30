import { Parser, Quad } from "n3";
import { useEffect, useState } from "react";
import { useUrl } from "../../contexts/url";
import { useContainer } from "../../hooks/container";
import FieldSet from "../ui/FieldSet";
import { ArchiveViewer } from "./ArchiveViewer";

export function ArchivesViewer() {
    const { isContainer } = useContainer()

    if (isContainer) return <></>

    const { url } = useUrl()
    const [archives, setArchives] = useState<Quad[]>([])

    async function versionQuery() {
        if (!url) return

        let response = await fetch(url, {
            headers: {
                "Content-Type": "application/version-query"
            },
            method: "GET"
        })

        if (response.ok) {
            let body = await response.text()
            const parser = new Parser()
            let quads = parser.parse(body)
            setArchives(quads)
        }
    }

    useEffect(() => {
        versionQuery()
    }, [url])

    return (
        <FieldSet header="Archives:" >
            {archives.length == 0 ? "No archives found" :
                archives.map(archive => (
                    <ArchiveViewer archiveID={archive.subject.value} date={new Date(archive.object.value)} />
                ))
            }
        </FieldSet >
    )
}