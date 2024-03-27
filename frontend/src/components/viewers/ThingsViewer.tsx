import { buildThing, createThing, getThing, isContainer, saveSolidDatasetAt, setThing } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { FormEvent, useRef, useState } from "react";
import { useResource } from "../../contexts/resource";
import { useUrl } from "../../contexts/url";
import { useDataset } from "../../hooks/dataset";
import { useThings } from "../../hooks/things";
import FieldSet from "../ui/FieldSet";
import ThingViewer from "./ThingViewer";

function ThingsViewer() {
    const things = useThings()
    const { fetchResource } = useResource()
    const dataset = useDataset()
    const { url } = useUrl()

    const [showThingEditor, setShowThingEditor] = useState(false)
    const subjectRef = useRef<HTMLInputElement>(null);
    const predicateRef = useRef<HTMLInputElement>(null);
    const objectRef = useRef<HTMLInputElement>(null);

    async function addThing(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const subject = subjectRef.current?.value
        const predicate = predicateRef.current?.value
        const object = objectRef.current?.value

        if (!subject || !predicate || !object) {
            alert("You must set the subject, predicate, and object!")
            return
        }

        const thingUrl = isContainer(dataset) ? url + subject : url + "#" + subject
        const thing = getThing(dataset, thingUrl) ?? createThing({name: subject })
        
        const newThing = buildThing(thing)
            .addStringNoLocale(predicate, object)
            .build()

        const newDataset = setThing(dataset, newThing)
        saveSolidDatasetAt(thingUrl, newDataset, { fetch: fetch })
            .then(() => {
                subjectRef.current!.value = ""
                predicateRef.current!.value = ""
                objectRef.current!.value = ""
                setShowThingEditor(false);
            })
            .then(fetchResource)
            .catch(alert)
    }

    return (
        <>
            <FieldSet header="Things:">
                {things.map((thing, i) => <ThingViewer key={i} thing={thing} />)}

                <button onClick={() => setShowThingEditor(!showThingEditor)}>Add Thing</button>
                {showThingEditor && (
                    <form onSubmit={addThing}>
                        <label htmlFor="subject">Subject:</label>
                        <input ref={subjectRef} name="subject" id="subject" />

                        <label htmlFor="predicate">Predicate:</label>
                        <input ref={predicateRef} name="predicate" id="predicate" />

                        <label htmlFor="object">Object:</label>
                        <input ref={objectRef} name="object" id="object" />

                        <button type="submit">Create</button>
                    </form>
                )}
            </FieldSet>
        </>
    )
}

export default ThingsViewer