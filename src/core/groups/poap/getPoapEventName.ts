import capitalize from "src/utils/common/capitalize"
import PoapGroupName from "./poapGroupName"

export default function getPoapEventName(groupName: PoapGroupName) {
    return capitalize(groupName.toLowerCase()).replace("_", " ")
}
