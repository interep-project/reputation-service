import capitalize from "src/utils/common/capitalize"
import PoapEvent from "./poapEvent"

export default function getPoapEvent(groupEvent: PoapEvent) {
    return capitalize(groupEvent.toLowerCase()).replace("_", " ")
}
