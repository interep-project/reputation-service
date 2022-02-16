import { MerkleTreeNode } from "@interep/db"
import config from "src/config"
import { Group, GroupName, Provider } from "src/types/groups"
import { defaultIncrementalMerkleTreeRoot } from "src/utils/common/crypto"
import checkGroup from "./checkGroup"

export default async function getGroup(provider: Provider, name: GroupName): Promise<Group> {
    if (!checkGroup(provider, name)) {
        throw new Error(`The ${provider} ${name} group does not exist`)
    }

    const root = await MerkleTreeNode.findByGroupAndLevelAndIndex({ name, provider }, config.MERKLE_TREE_DEPTH, 0)

    return {
        provider,
        name,
        rootHash: root ? root.hash : defaultIncrementalMerkleTreeRoot.toString(),
        size: await MerkleTreeNode.getNumberOfActiveLeaves({ name, provider })
    }
}
