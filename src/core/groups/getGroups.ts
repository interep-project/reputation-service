import { Group, Provider } from "src/types/groups"
import { getAllProviders } from "."
import getGroup from "./getGroup"
import getGroupIds from "./getGroupIds"

export default async function getGroups(provider?: Provider): Promise<Group[]> {
    if (provider) {
        return Promise.all(getGroupIds(provider).map(getGroup))
    }

    const providers = getAllProviders()
    let groups: Group[] = []

    for (const provider of providers) {
        groups = groups.concat(await getGroups(provider))
    }

    return groups
}
