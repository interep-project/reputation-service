import { ReputationLevel } from "@interrep/reputation-criteria"
import config from "src/config"
import { checkGroup, getGroupId } from "src/core/groups"
import { MerkleTreeNode, MerkleTreeZero } from "src/models/merkleTree/MerkleTree.model"
import { IMerkleTreeNodeDocument } from "src/models/merkleTree/MerkleTree.types"
import { Provider } from "src/types/groups"
import poseidonHash from "src/utils/common/crypto/hasher"
import { PoapGroupName } from "../poap"

export default async function previewNewRoot(
    provider: Provider,
    reputationOrName: ReputationLevel | PoapGroupName,
    idCommitment: string
): Promise<string> {
    const groupId = getGroupId(provider, reputationOrName)

    if (!checkGroup(provider, reputationOrName)) {
        throw new Error(`The group ${groupId} does not exist`)
    }

    if (await MerkleTreeNode.findByGroupIdAndHash(groupId, idCommitment)) {
        throw new Error(`The identity commitment ${idCommitment} already exist`)
    }

    // Get the zero hashes.
    const zeroes = await MerkleTreeZero.findZeroes()

    if (!zeroes || zeroes.length === 0) {
        throw new Error(`The zero hashes have not yet been created`)
    }

    // Get next available index at level 0.
    let currentIndex = await MerkleTreeNode.getNumberOfNodes(groupId, 0)

    if (currentIndex >= 2 ** config.MERKLE_TREE_LEVELS) {
        throw new Error(`The tree is full`)
    }

    let hash = idCommitment

    for (let level = 0; level < config.MERKLE_TREE_LEVELS; level++) {
        if (currentIndex % 2 === 0) {
            const siblingHash = zeroes[level].hash

            hash = poseidonHash(hash, siblingHash)
        } else {
            const siblingNode = (await MerkleTreeNode.findByLevelAndIndex({
                groupId,
                level,
                index: currentIndex - 1
            })) as IMerkleTreeNodeDocument

            hash = poseidonHash(siblingNode.hash, hash)
        }

        currentIndex = Math.floor(currentIndex / 2)
    }

    return hash
}
