import { MerkleTreeNode } from "src/models/merkleTree/MerkleTree.model"
import { checkGroup } from "src/core/groups"

export default async function retrievePath(groupId: string, idCommitment: string): Promise<any> {
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
