import { SolidDataset, WithResourceInfo, getContainedResourceUrlAll } from "@inrupt/solid-client"
import { Link } from "react-router-dom"
import FieldSet from "../ui/FieldSet"

interface Props {
    dataset: SolidDataset & WithResourceInfo;
}

function ContainerViewer({ dataset }: Props) {
    const containedResources = getContainedResourceUrlAll(dataset)

    return (
        <FieldSet header="Contained Resources:">
            {containedResources.map(url => (
                <li key={url}>
                    <Link to={`/explore/?url=${encodeURIComponent(url)}`}>{url}</Link>
                </li>
            ))}
        </FieldSet>
    )
}

export default ContainerViewer