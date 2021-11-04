import { ReputationLevel } from "@interrep/reputation-criteria"
import config from "src/config"
import { checkGroup } from "src/core/groups"
import { MerkleTreeNodeDocument, MerkleTreeNode, MerkleTreeZero } from "@interrep/db"
import { Provider } from "src/types/groups"
import poseidonHash from "src/utils/common/crypto/hasher"
import { PoapGroupName } from "../poap"

export default async function previewNewRoot(
    provider: Provider,
    name: ReputationLevel | PoapGroupName | string,
    identityCommitment: string
): Promise<string> {
    if (!checkGroup(provider, name)) {
        throw new Error(`The group ${provider} ${name} does not exist`)
    }

    if (await MerkleTreeNode.findByGroupAndHash({ provider, name }, identityCommitment)) {
        throw new Error(`The identity commitment ${identityCommitment} already exist`)
    }

    // Get the zero hashes.
    const zeroes = await MerkleTreeZero.find()

    if (!zeroes || zeroes.length === 0) {
        throw new Error(`The zero hashes have not yet been created`)
    }

    // Get next available index at level 0.
    let currentIndex = await MerkleTreeNode.getNumberOfNodes({ provider, name }, 0)

    if (currentIndex >= 2 ** config.MERKLE_TREE_DEPTH) {
        throw new Error(`The tree is full`)
    }

    let hash = identityCommitment

    for (let level = 0; level < config.MERKLE_TREE_DEPTH; level++) {
        if (currentIndex % 2 === 0) {
            const siblingHash = zeroes[level].hash

            hash = poseidonHash(hash, siblingHash)
        } else {
            const siblingNode = (await MerkleTreeNode.findByGroupAndLevelAndIndex(
                { provider, name },
                level,
                currentIndex - 1
            )) as MerkleTreeNodeDocument

            hash = poseidonHash(siblingNode.hash, hash)
        }

        currentIndex = Math.floor(currentIndex / 2)
    }

    return hash
}
