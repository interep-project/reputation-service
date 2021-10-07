import { ReputationLevel } from "@interrep/reputation-criteria"
import { MerkleTreeNode } from "src/models/merkleTree/MerkleTree.model"
import { Group, Provider } from "src/types/groups"
import { getGroupId } from "."
import checkGroup from "./checkGroup"
import { PoapGroupName } from "./poap"

export default async function getGroup(provider: Provider, name: ReputationLevel | PoapGroupName): Promise<Group> {
    const groupId = getGroupId(provider, name)

    if (!checkGroup(provider, name)) {
        throw new Error(`The group ${groupId} does not exist`)
    }

    return {
        name,
        provider,
        size: await MerkleTreeNode.getNumberOfNodes(groupId, 0)
    }
}
