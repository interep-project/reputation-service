import { getReputationLevels, ReputationLevel } from "@interrep/reputation-criteria"
import { getPoapEvents, PoapEvent } from "src/core/poap"
import { Provider, Web3Provider } from "src/types/groups"

export default function checkGroup(provider: Provider, name: ReputationLevel | PoapEvent | string): boolean {
    if (provider === "telegram" || provider === "email") {
        return true
    }

    if (provider === Web3Provider.POAP) {
        const poapGroupNames = getPoapEvents()

        return poapGroupNames.indexOf(name as PoapEvent) !== -1
    }

    const reputationLevels = getReputationLevels(provider)

    return reputationLevels.indexOf(name as ReputationLevel) !== -1
}
