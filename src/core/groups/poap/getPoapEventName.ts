import { capitalize } from "src/utils/frontend/capitalize"
import PoapGroupId from "./poapGroupIds"

export default function getPoapEventName(groupId: PoapGroupId) {
    return capitalize(groupId.substr(5).toLowerCase()).replace("_", " ")
}
