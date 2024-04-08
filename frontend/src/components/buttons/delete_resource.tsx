import { deleteContainer, deleteSolidDataset, isContainer } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { useResource } from "../../contexts/resource";

export function DeleteResourceButton() {
    const { resource, fetchResource } = useResource()

    function onDelete() {
        if (confirm("Are you sure you want to delete this resource?")) {
            if (isContainer(resource)) {
                deleteContainer(resource, { fetch: fetch }).catch(alert)
            } else {
                deleteSolidDataset(resource, { fetch: fetch }).catch(alert)
            }
            fetchResource()
        }
    }

    return (
        <button onClick={onDelete}>Delete resource</button>
    )
}