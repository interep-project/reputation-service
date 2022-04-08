import { getReputationLevels, ReputationLevel } from "@interep/reputation"
import { getTelegramGroups, TelegramGroup } from "@interep/telegram-bot"
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

    const reputationLevels = getReputationLevels()

    return reputationLevels.indexOf(name as ReputationLevel) !== -1
}
