import { ReputationLevel } from "@interrep/reputation-criteria"
import { MerkleTreeNode } from "@interrep/db"
import { Group, Provider } from "src/types/groups"
import checkGroup from "./checkGroup"
import { PoapGroupName } from "./poap"

export default async function getGroup(
    provider: Provider,
    name: ReputationLevel | PoapGroupName | string
): Promise<Group> {
    if (!checkGroup(provider, name)) {
        throw new Error(`The ${provider} ${name} group does not exist`)
    }

    return {
        name,
        provider,
        size: await MerkleTreeNode.getNumberOfNodes({ name, provider }, 0)
    }
}
