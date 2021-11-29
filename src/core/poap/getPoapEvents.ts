import PoapEvent from "./poapEvent"

export default function getPoapEvents(): PoapEvent[] {
    return Object.values(PoapEvent)
}
