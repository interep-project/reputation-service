import { getReputationLevels } from "@interrep/reputation-criteria"
import { MerkleTreeNode } from "@interrep/db"
import { Group, Provider, Web3Provider } from "src/types/groups"
import { getProviders } from "."
import getGroup from "./getGroup"
import { getPoapGroupNames } from "./poap"

export default async function getGroups(provider?: Provider): Promise<Group[]> {
    if (provider) {
        if (provider === Web3Provider.POAP) {
            const poapGroupNames = getPoapGroupNames()

            return Promise.all(poapGroupNames.map((poapGroupName) => getGroup(provider, poapGroupName)))
        }

        if (provider === "telegram") {
            const telegramGroupNames = await MerkleTreeNode.getGroupNamesByProvider(provider)

            return Promise.all(telegramGroupNames.map((telegramGroupName) => getGroup(provider, telegramGroupName)))
        }

        if (provider === "email") {
            const emailGroupNames = await MerkleTreeNode.getGroupNamesByProvider(provider)

            return Promise.all(emailGroupNames.map((emailGroupName) => getGroup(provider, emailGroupName)))
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
