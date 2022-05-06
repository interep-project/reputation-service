import { MerkleTreeNode, MerkleTreeRootBatch } from "@interep/db"
import { merkleTreeDepths } from "src/config"
import { Group, GroupName, Provider } from "src/types/groups"
import { createIncrementalMerkleTree } from "src/utils/common/crypto"
import checkGroup from "./checkGroup"

export default async function getGroup(provider: Provider, name: GroupName): Promise<Group> {
    if (!checkGroup(provider, name)) {
        throw new Error(`The ${provider} ${name} group does not exist`)
    }

    const root = await MerkleTreeNode.findOne({ group: { provider, name }, siblingHash: undefined })

    const group: Group = {
        provider,
        name,
        depth: merkleTreeDepths[provider],
        root: root ? root.hash : createIncrementalMerkleTree(provider).root.toString(),
        size: await MerkleTreeNode.getNumberOfActiveLeaves({ name, provider }),
        numberOfLeaves: await MerkleTreeNode.getNumberOfNodes({ name, provider }, 0)
    }

    const [rootBatch] = await MerkleTreeRootBatch.find({
        group: { provider, name }
    })
        .sort({ "transaction.blockNumber": -1 })
        .limit(1)

    if (rootBatch && rootBatch.transaction && rootBatch.transaction.hash) {
        group.onchainRoot = rootBatch.roots[rootBatch.roots.length - 1]
    }

    return group
}
