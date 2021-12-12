import { MerkleTreeNode } from "@interrep/db"
import { getReputationLevels } from "@interrep/reputation-criteria"
import { getPoapEvents } from "src/core/poap"
import { Group, Provider, Web3Provider } from "src/types/groups"
import { getProviders } from "."
import { getEmailDomains } from "../email"
import getGroup from "./getGroup"

export default async function getGroups(provider?: Provider): Promise<Group[]> {
    if (provider) {
        if (provider === Web3Provider.POAP) {
            const poapEvents = getPoapEvents()

            return Promise.all(poapEvents.map((poapEvent) => getGroup(provider, poapEvent)))
        }

        if (provider === "telegram") {
            const telegramGroupNames = await MerkleTreeNode.getGroupNamesByProvider(provider)

            return Promise.all(telegramGroupNames.map((telegramGroupName) => getGroup(provider, telegramGroupName)))
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
