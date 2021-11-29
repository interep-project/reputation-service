import PoapEvent from "./poapEvent"

export default function getPoapEventFancyId(groupEvent: PoapEvent) {
    return groupEvent.toLowerCase().replace("_", "")
}
