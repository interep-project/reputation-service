import { getReputationLevels, ReputationLevel } from "@interrep/reputation-criteria"
import { Provider, Web3Provider } from "src/types/groups"
import { getPoapGroupNames, PoapGroupName } from "./poap"

export default function checkGroup(provider: Provider, reputationOrName: ReputationLevel | PoapGroupName): boolean {
    if (provider === Web3Provider.POAP) {
        const poapGroupNames = getPoapGroupNames()

        return poapGroupNames.indexOf(reputationOrName as PoapGroupName) !== -1
    }

    const reputationLevels = getReputationLevels(provider)

    return reputationLevels.indexOf(reputationOrName as ReputationLevel) !== -1
}
