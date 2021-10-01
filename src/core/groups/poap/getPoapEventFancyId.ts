import PoapGroupId from "./poapGroupIds"

export default function getPoapEventFancyId(groupId: PoapGroupId) {
    return groupId.substr(5).toLowerCase().replace("_", "")
}
