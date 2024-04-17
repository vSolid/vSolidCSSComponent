import { solidDatasetAsTurtle } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { useEffect, useState } from "react";
import { useResource } from "../../contexts/resource";
import { useUrl } from "../../contexts/url";
import { useDataset } from "../../hooks/dataset";
import FieldSet from "../ui/FieldSet";

function TurtleViewer() {
    const [turtleContent, setTurtleContent] = useState<string>()
    const [editable, setEditable] = useState<boolean>(false)
    const dataset = useDataset()
    const { url } = useUrl()
    const { fetchResource } = useResource()

    useEffect(() => {
        solidDatasetAsTurtle(dataset).then(turtle => {
            setTurtleContent(turtle)
        })
    }, [dataset])

    function handleEditButton() {
        if (editable) {
            const confirmed = confirm("Are you sure you would like to submit? This can corrupt your data if it is not corrupt.")
            if (!confirmed) return;
            handleSubmit();
            setEditable(false);
        } else {
            setEditable(true);
        }
    }

    async function handleSubmit() {
        if (!url) return
        
        try {
            const res = await fetch(url, {
                method: "PUT",
                body: turtleContent,
                headers: {
                    "Content-Type": "text/turtle",
                },
            })
            if (!res.ok) {
                throw new Error(`${res.statusText} (${res.status})`);
            }
            fetchResource()
        }
        catch (error) {
            alert(error)
        }
    }

    return (
        <FieldSet header="Raw Turtle:">
            <details>
                <summary>Show/hide</summary>
                <div>
                    <textarea
                        disabled={!editable}
                        cols={100}
                        rows={50}
                        value={turtleContent}
                        onChange={(e) => setTurtleContent(e.target.value)}
                    />
                </div>
                <button onClick={handleEditButton}>
                    {editable ? "Save" : "Edit (dangerous)"}
                </button>
                {editable && <>&nbsp;<button onClick={() => setEditable(false)}>Cancel</button></>}
            </details>
        </FieldSet>
    )
}

export default TurtleViewer