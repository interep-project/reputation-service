import { ReputationLevel } from "@interrep/reputation-criteria"
import { MerkleTreeNode } from "src/models/merkleTree/MerkleTree.model"
import { Group, Provider } from "src/types/groups"
import { getGroupId } from "."
import checkGroup from "./checkGroup"
import { PoapGroupName } from "./poap"

export default async function getGroup(
    provider: Provider,
    reputationOrName: ReputationLevel | PoapGroupName
): Promise<Group> {
    const groupId = getGroupId(provider, reputationOrName)

    if (!checkGroup(provider, reputationOrName)) {
        throw new Error(`The group ${groupId} does not exist`)
    }

    const group: Group = {
        provider,
        size: await MerkleTreeNode.getNumberOfNodes(groupId, 0)
    }

    if (reputationOrName in ReputationLevel) {
        group.reputation = reputationOrName as ReputationLevel
    } else {
        group.name = reputationOrName
    }

    return group
}
