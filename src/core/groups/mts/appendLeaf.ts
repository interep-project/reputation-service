import { MerkleTreeNode, MerkleTreeNodeDocument, MerkleTreeRootBatch, MerkleTreeZero } from "@interep/db"
import config from "src/config"
import { checkGroup } from "src/core/groups"
import { GroupName, Provider } from "src/types/groups"
import { poseidon } from "src/utils/common/crypto"

/**
 * Appends a leaf on a tree.
 * @param provider The provider of the group.
 * @param name The name of the group.
 * @param identityCommitment The leaf of the tree.
 * @returns The new Merkle tree root.
 */
export default async function appendLeaf(
    provider: Provider,
    name: GroupName,
    identityCommitment: string
): Promise<string> {
    if (!checkGroup(provider, name)) {
        throw new Error(`The group ${provider} ${name} does not exist`)
    }

    // Get the zero hashes.
    const zeroes = await MerkleTreeZero.find()

    if (!zeroes || zeroes.length !== config.MERKLE_TREE_DEPTH) {
        throw new Error(`The zero hashes have not yet been created`)
    }

    if (await MerkleTreeNode.findByGroupAndHash({ provider, name }, identityCommitment)) {
        throw new Error(`The identity commitment ${identityCommitment} already exist`)
    }

    // Get next available index at level 0.
    let currentIndex = await MerkleTreeNode.getNumberOfNodes({ provider, name }, 0)

    /* istanbul ignore next */
    if (currentIndex >= 2 ** config.MERKLE_TREE_DEPTH) {
        throw new Error(`The tree is full`)
    }

    let node = await MerkleTreeNode.create({
        group: { provider, name },
        level: 0,
        index: currentIndex,
        hash: identityCommitment
    })

    for (let level = 0; level < config.MERKLE_TREE_DEPTH; level++) {
        if (currentIndex % 2 === 0) {
            node.siblingHash = zeroes[level].hash

            let parentNode = await MerkleTreeNode.findByGroupAndLevelAndIndex(
                { provider, name },
                level + 1,
                Math.floor(currentIndex / 2)
            )

            if (parentNode) {
                parentNode.hash = poseidon(node.hash, node.siblingHash)

                await parentNode.save()
            } else {
                parentNode = await MerkleTreeNode.create({
                    group: {
                        provider,
                        name
                    },
                    level: level + 1,
                    index: Math.floor(currentIndex / 2),
                    hash: poseidon(node.hash, node.siblingHash)
                })
            }

            node.parent = parentNode

            await node.save()

            node = parentNode
        } else {
            const siblingNode = (await MerkleTreeNode.findByGroupAndLevelAndIndex(
                { provider, name },
                level,
                currentIndex - 1
            )) as MerkleTreeNodeDocument

            node.siblingHash = siblingNode.hash
            siblingNode.siblingHash = node.hash

            const parentNode = (await MerkleTreeNode.findByGroupAndLevelAndIndex(
                { provider, name },
                level + 1,
                Math.floor(currentIndex / 2)
            )) as MerkleTreeNodeDocument

            parentNode.hash = poseidon(siblingNode.hash, node.hash)

            node.parent = parentNode

            await node.save()
            await parentNode.save()
            await siblingNode.save()

            node = parentNode
        }

        currentIndex = Math.floor(currentIndex / 2)
    }

    let rootBatch = await MerkleTreeRootBatch.findOne({ group: { provider, name }, transaction: undefined })

    if (!rootBatch) {
        rootBatch = new MerkleTreeRootBatch({
            group: {
                provider,
                name
            }
        })
    }

    rootBatch.rootHashes.push(node.hash)

    await rootBatch.save()

    return node.hash
}
