import { getReputationLevels, ReputationLevel } from "@interrep/reputation-criteria"
import { Provider, Web3Provider } from "src/types/groups"
import { getPoapGroupNames, PoapGroupName } from "./poap"

export default function checkGroup(provider: Provider, name: ReputationLevel | PoapGroupName): boolean {
    if (provider === Web3Provider.POAP) {
        const poapGroupNames = getPoapGroupNames()

        return poapGroupNames.indexOf(name as PoapGroupName) !== -1
    }

    const reputationLevels = getReputationLevels(provider)

    return reputationLevels.indexOf(name as ReputationLevel) !== -1
}
