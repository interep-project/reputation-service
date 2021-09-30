import { getReputationLevels } from "@interrep/reputation-criteria"
import { Provider, Web3Provider } from "src/types/groups"
import getAllProviders from "./getAllProviders"
import { PoapGroupId } from "./poap"

export default function getGroupIds(provider?: Provider): string[] {
    if (provider && provider === Web3Provider.POAP) {
        return Object.values(PoapGroupId)
    }

    if (provider) {
        const reputationLevels = getReputationLevels(provider)

        return reputationLevels.map((reputation) => `${provider.toUpperCase()}_${reputation}`)
    }

    const providers = getAllProviders()
    let groups: string[] = []

    for (const provider of providers) {
        groups = groups.concat(getGroupIds(provider))
    }

    return groups
}
