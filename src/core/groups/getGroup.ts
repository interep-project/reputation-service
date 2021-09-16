import { MerkleTreeNode } from "src/models/merkleTree/MerkleTree.model"
import { Group } from "src/types/groups"
import checkGroup from "./checkGroup"

export default async function getGroup(groupId: string): Promise<Group> {
    if (!checkGroup(groupId)) {
        throw new Error(`The group ${groupId} does not exist`)
    }

    return {
        id: groupId,
        size: await MerkleTreeNode.getNumberOfNodes(groupId, 0)
    }
}
