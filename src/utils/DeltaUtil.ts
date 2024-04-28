import { ResourceIdentifier } from "@solid/community-server";

export function getDeltaIdentifier(fromIdentifier: ResourceIdentifier): ResourceIdentifier {
    return { path: fromIdentifier.path + ".vSolid" }
}
