import { MerkleTreeNode } from "@interrep/db"
import { ReputationLevel } from "@interrep/reputation-criteria"
import config from "src/config"
import { PoapEvent } from "src/core/poap"
import { Group, Provider } from "src/types/groups"
import checkGroup from "./checkGroup"

export default async function getGroup(provider: Provider, name: ReputationLevel | PoapEvent | string): Promise<Group> {
    if (!checkGroup(provider, name)) {
        throw new Error(`The ${provider} ${name} group does not exist`)
    }

    const root = await MerkleTreeNode.findByGroupAndLevelAndIndex({ name, provider }, config.MERKLE_TREE_DEPTH, 0)

    return {
        provider,
        name,
        rootHash: root ? root.hash : "0",
        size: await MerkleTreeNode.getNumberOfActiveLeaves({ name, provider })
    }
}
