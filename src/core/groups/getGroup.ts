import { MerkleTreeNode } from "src/models/merkleTree/MerkleTree.model"
import { Group, Provider } from "src/types/groups"
import checkGroup from "./checkGroup"

export default async function getGroup(groupId: string): Promise<Group> {
    if (!checkGroup(groupId)) {
        throw new Error(`The group ${groupId} does not exist`)
    }

    return {
        id: groupId,
        provider: groupId.split("_")[0].toLowerCase() as Provider,
        size: await MerkleTreeNode.getNumberOfNodes(groupId, 0)
    }
}
