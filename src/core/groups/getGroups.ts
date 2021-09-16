import { getPlatforms, Platform } from "@interrep/reputation-criteria"
import { Group } from "src/types/groups"
import getGroupIds from "./getGroupIds"
import getGroup from "./getGroup"

export default async function getGroups(platform?: Platform): Promise<Group[]> {
    if (platform) {
        return Promise.all(getGroupIds(platform).map(getGroup))
    }

    const platforms = getPlatforms()
    let groups: Group[] = []

    for (const platform of platforms) {
        groups = groups.concat(await getGroups(platform))
    }

    return groups
}
