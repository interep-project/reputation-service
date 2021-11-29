import { MerkleTreeNode } from "@interrep/db"
import { ReputationLevel } from "@interrep/reputation-criteria"
import { PoapEvent } from "src/core/poap"
import { Group, Provider } from "src/types/groups"
import checkGroup from "./checkGroup"

export default async function getGroup(provider: Provider, name: ReputationLevel | PoapEvent | string): Promise<Group> {
    if (!checkGroup(provider, name)) {
        throw new Error(`The ${provider} ${name} group does not exist`)
    }

    return {
        name,
        provider,
        size: await MerkleTreeNode.getNumberOfActiveLeaves({ name, provider })
    }
}
