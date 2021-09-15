import getGroupIds from "./getGroupIds"

export default function checkGroupId(groupId: string): boolean {
    const groups = getGroupIds()

    return groups.indexOf(groupId) !== -1
}
