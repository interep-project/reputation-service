import { getReputationLevels, ReputationLevel } from "@interrep/reputation"
import { getPoapEvents, PoapEvent } from "src/core/poap"
import { Provider, Web3Provider } from "src/types/groups"
import { EmailDomain, getEmailDomains } from "../email"

export default function checkGroup(provider: Provider, name: ReputationLevel | PoapEvent | string): boolean {
    if (provider === "telegram") {
        return true
    }

    if (provider === "email") {
        const emailDomains = getEmailDomains()

        return emailDomains.indexOf(name as EmailDomain) !== -1
    }

    if (provider === Web3Provider.POAP) {
        const poapGroupNames = getPoapEvents()

        return poapGroupNames.indexOf(name as PoapEvent) !== -1
    }

    const reputationLevels = getReputationLevels(provider)

    return reputationLevels.indexOf(name as ReputationLevel) !== -1
}
