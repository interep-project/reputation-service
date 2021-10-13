import { getReputationLevels } from "@interrep/reputation-criteria"
import { Group, Provider, Web3Provider } from "src/types/groups"
import { getAllProviders } from "."
import getGroup from "./getGroup"
import { getPoapGroupNames } from "./poap"

export default async function getGroups(provider?: Provider): Promise<Group[]> {
    if (provider) {
        if (provider === Web3Provider.POAP) {
            const poapGroupNames = getPoapGroupNames()

            return Promise.all(poapGroupNames.map((poapGroupName) => getGroup(provider, poapGroupName)))
        }

        const reputationLevels = getReputationLevels(provider)

        return Promise.all(reputationLevels.map((reputation) => getGroup(provider, reputation)))
    }

    const providers = getAllProviders()
    let groups: Group[] = []

    for (const provider of providers) {
        groups = groups.concat(await getGroups(provider))
    }

    return groups
}
