import { getReputationLevels } from "@interrep/reputation-criteria"
import { Provider, Web3Provider } from "src/types/groups"
import getAllProviders from "./getAllProviders"
import getGroupId from "./getGroupId"
import { getPoapGroupNames } from "./poap"

export default function getGroupIds(provider?: Provider): string[] {
    if (provider) {
        switch (provider) {
            case Web3Provider.POAP: {
                const poapGroupNames = getPoapGroupNames()

                return poapGroupNames.map((poapGroupName) => getGroupId(provider, poapGroupName))
            }
            default: {
                const reputationLevels = getReputationLevels(provider)

                return reputationLevels.map((reputation) => getGroupId(provider, reputation))
            }
        }
    }

    const providers = getAllProviders()
    let groups: string[] = []

    for (const provider of providers) {
        groups = groups.concat(getGroupIds(provider))
    }

    return groups
}
