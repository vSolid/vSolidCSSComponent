import { SolidDataset, solidDatasetAsTurtle } from "@inrupt/solid-client";
import { useEffect, useState } from "react";
import FieldSet from "../ui/FieldSet";

interface Props {
    dataset: SolidDataset
}

function TurtleViewer({ dataset }: Props) {
    const [turtleContent, setTurtleContent] = useState<string>()

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