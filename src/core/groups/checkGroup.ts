import { getReputationLevels, ReputationLevel } from "@interrep/reputation"
import { getTelegramGroups, TelegramGroup } from "@interrep/telegram-bot"
import { getPoapEvents, PoapEvent } from "src/core/poap"
import { GroupName, Provider } from "src/types/groups"
import { EmailDomain, getEmailDomains } from "../email"

export default function checkGroup(provider: Provider, name: GroupName): boolean {
    if (provider === "telegram") {
        const telegramGroups = getTelegramGroups()

        return telegramGroups.indexOf(name as TelegramGroup) !== -1
    }

    if (provider === "email") {
        const emailDomains = getEmailDomains()

        return emailDomains.indexOf(name as EmailDomain) !== -1
    }

    if (provider === "poap") {
        const poapGroupNames = getPoapEvents()

        return poapGroupNames.indexOf(name as PoapEvent) !== -1
    }

    const reputationLevels = getReputationLevels(provider)

    return reputationLevels.indexOf(name as ReputationLevel) !== -1
}
