import { solidDatasetAsTurtle } from "@inrupt/solid-client";
import { useEffect, useState } from "react";
import { useDataset } from "../../hooks/dataset";
import FieldSet from "../ui/FieldSet";

function TurtleViewer() {
    const [turtleContent, setTurtleContent] = useState<string>()
    const dataset = useDataset()

    useEffect(() => {
        solidDatasetAsTurtle(dataset).then(turtle => {
            setTurtleContent(turtle)
        })
    }, [dataset])

    return (
        <FieldSet header="Raw Turtle:">
            <details>
                <summary>Show/hide</summary>
                <div style={{whiteSpace: "pre-line"}}>{turtleContent}</div>
            </details>
        </FieldSet>
    )
}

export default TurtleViewer