import { WithResourceInfo, deleteContainer, deleteSolidDataset, isContainer } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";

interface Props {
    resource: WithResourceInfo;
}

export function DeleteResourceButton({ resource }: Props) {
    function onDelete() {
        if (confirm("Are you sure you want to delete this resource?")) {
            if (isContainer(resource)) {
                deleteContainer(resource, { fetch: fetch }).then(() => alert(`You deleted the container!`)).catch(alert)
            } else {
                deleteSolidDataset(resource, { fetch: fetch }).then(() => alert(`You deleted the dataset`)).catch(alert)
            }
        }
    }

    return (
        <button onClick={onDelete}>Delete resource</button>
    )
}