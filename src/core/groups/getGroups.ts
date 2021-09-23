import { getWeb2Providers, Web2Provider } from "@interrep/reputation-criteria"
import { Group } from "src/types/groups"
import getGroupIds from "./getGroupIds"
import getGroup from "./getGroup"

export default async function getGroups(web2Provider?: Web2Provider): Promise<Group[]> {
    if (web2Provider) {
        return Promise.all(getGroupIds(web2Provider).map(getGroup))
    }

    const web2Providers = getWeb2Providers()
    let groups: Group[] = []

    for (const web2Provider of web2Providers) {
        groups = groups.concat(await getGroups(web2Provider))
    }

    return groups
}
