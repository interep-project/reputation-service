import PoapEvent from "./poapEvent"

export default function getPoapEventFancyId(poapEvent: PoapEvent) {
    return poapEvent.toLowerCase().replace("_", "")
}
