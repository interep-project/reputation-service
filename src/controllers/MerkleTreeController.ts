import { checkGroup } from "src/core/groups"
import config from "../config"
import { MerkleTreeNode, MerkleTreeZero } from "../models/merkleTree/MerkleTree.model"
import { IMerkleTreeNodeDocument } from "../models/merkleTree/MerkleTree.types"
import poseidonHash from "../utils/common/crypto/hasher"

class MerkleTreeController {
    public appendLeaf = async (groupId: string, idCommitment: string): Promise<string> => {
        if (!checkGroup(groupId)) {
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

        let node = await MerkleTreeNode.create({
            key: { groupId, level: 0, index: currentIndex },
            hash: idCommitment
        })

        for (let level = 0; level < config.MERKLE_TREE_LEVELS; level++) {
            if (currentIndex % 2 === 0) {
                node.siblingHash = zeroes[level].hash

                let parentNode = await MerkleTreeNode.findByLevelAndIndex({
                    groupId,
                    level: level + 1,
                    index: Math.floor(currentIndex / 2)
                })

                if (parentNode) {
                    parentNode.hash = poseidonHash(node.hash, node.siblingHash)

                    await parentNode.save()
                } else {
                    parentNode = await MerkleTreeNode.create({
                        key: {
                            groupId,
                            level: level + 1,
                            index: Math.floor(currentIndex / 2)
                        },
                        hash: poseidonHash(node.hash, node.siblingHash)
                    })
                }

                node.parent = parentNode

                await node.save()

                node = parentNode
            } else {
                const siblingNode = (await MerkleTreeNode.findByLevelAndIndex({
                    groupId,
                    level,
                    index: currentIndex - 1
                })) as IMerkleTreeNodeDocument

                node.siblingHash = siblingNode.hash
                siblingNode.siblingHash = node.hash

                const parentNode = (await MerkleTreeNode.findByLevelAndIndex({
                    groupId,
                    level: level + 1,
                    index: Math.floor(currentIndex / 2)
                })) as IMerkleTreeNodeDocument

                parentNode.hash = poseidonHash(siblingNode.hash, node.hash)

                node.parent = parentNode

                await node.save()
                await parentNode.save()
                await siblingNode.save()

                node = parentNode
            }

            currentIndex = Math.floor(currentIndex / 2)
        }

        return node.hash
    }

    public previewNewRoot = async (groupId: string, idCommitment: string): Promise<string> => {
        if (!checkGroup(groupId)) {
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

    public retrievePath = async (groupId: string, idCommitment: string): Promise<any> => {
        if (!checkGroup(groupId)) {
            throw new Error(`The group ${groupId} does not exist`)
        }

        // Get path starting from leaf node.
        const leafNode = await MerkleTreeNode.findByGroupIdAndHash(groupId, idCommitment)

        if (!leafNode) {
            throw new Error(`The identity commitment does not exist`)
        }

        const { key } = leafNode

        // Get path and return array.
        const pathQuery = MerkleTreeNode.aggregate([
            {
                $match: {
                    key
                }
            },
            {
                $graphLookup: {
                    from: "treeNodes",
                    startWith: "$_id",
                    connectFromField: "parent",
                    connectToField: "_id",
                    as: "path",
                    depthField: "level"
                }
            },
            {
                $unwind: {
                    path: "$path"
                }
            },
            {
                $project: {
                    path: 1,
                    _id: 0
                }
            },
            {
                $addFields: {
                    hash: "$path.hash",
                    sibling: "$path.siblingHash",
                    index: { $mod: ["$path.key.index", 2] },
                    level: "$path.level"
                }
            },
            {
                $sort: {
                    level: 1
                }
            },
            {
                $project: {
                    path: 0
                }
            }
        ])

        return new Promise((resolve, reject) => {
            pathQuery.exec((error, path) => {
                if (error) {
                    reject(error)
                }

                const root = path.pop().hash
                const pathElements = path.map((n) => n.sibling)
                const indices = path.map((n) => n.index)

                resolve({ pathElements, indices, root })
            })
        })
    }
}

export default new MerkleTreeController()
