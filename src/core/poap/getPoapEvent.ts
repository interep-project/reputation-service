import capitalize from "src/utils/common/capitalize"
import PoapEvent from "./poapEvent"

export default function getPoapEvent(poapEvent: PoapEvent) {
    return capitalize(poapEvent.toLowerCase()).replace("_", " ")
}
