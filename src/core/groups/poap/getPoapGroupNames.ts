import { PoapGroupName } from "."

export default function getPoapGroupNames(): PoapGroupName[] {
    return Object.values(PoapGroupName)
}
