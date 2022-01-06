import { getReputationLevels } from "@interrep/reputation"
import { getTelegramGroups } from "@interrep/telegram-bot"
import { getPoapEvents } from "src/core/poap"
import { Group, Provider } from "src/types/groups"
import { getProviders } from "."
import { getEmailDomains } from "../email"
import getGroup from "./getGroup"

export default async function getGroups(provider?: Provider): Promise<Group[]> {
    if (provider) {
        if (provider === "poap") {
            const poapEvents = getPoapEvents()

            return Promise.all(poapEvents.map((poapEvent) => getGroup(provider, poapEvent)))
        }

        if (provider === "telegram") {
            const telegramGroups = getTelegramGroups()

            return Promise.all(telegramGroups.map((telegramGroup) => getGroup(provider, telegramGroup)))
        }

        if (provider === "email") {
            const emailDomains = getEmailDomains()

            return Promise.all(emailDomains.map((emailDomain) => getGroup(provider, emailDomain)))
        }

        const reputationLevels = getReputationLevels(provider)

        return Promise.all(reputationLevels.map((reputation) => getGroup(provider, reputation)))
    }

    const providers = getProviders()
    let groups: Group[] = []

    for (const provider of providers) {
        groups = groups.concat(await getGroups(provider))
    }

    return groups
}
