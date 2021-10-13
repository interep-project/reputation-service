import PoapGroupName from "./poapGroupName"

export default function getPoapEventFancyId(groupName: PoapGroupName) {
    return groupName.toLowerCase().replace("_", "")
}
