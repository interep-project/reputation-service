import { MerkleTreeNode } from "@interrep/db"
import { checkGroup } from "src/core/groups"
import { GroupName, Provider } from "src/types/groups"

/**
 * Returns the Merkle proof of a tree leaf.
 * @param provider The provider of the group.
 * @param name The name of the group.
 * @param identityCommitment The leaf of the tree.
 * @returns The Merkle proof.
 */
export default async function createProof(
    provider: Provider,
    name: GroupName,
    identityCommitment: string
): Promise<any> {
    if (!checkGroup(provider, name)) {
        throw new Error(`The group ${provider} ${name} does not exist`)
    }

    // Get proof starting from the leaf node.
    const leafNode = await MerkleTreeNode.findByGroupAndHash({ provider, name }, identityCommitment)

    if (!leafNode) {
        throw new Error(`The identity commitment does not exist`)
    }

    const { index, level } = leafNode

    // Get proof and return array.
    const proofQuery = MerkleTreeNode.aggregate([
        {
            $match: {
                index,
                level,
                group: {
                    provider,
                    name
                }
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
                index: { $mod: ["$path.index", 2] },
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
    const proof = await proofQuery.exec()

    const root = proof.pop().hash
    const siblingNodes = proof.map((n: any) => n.sibling)
    const path = proof.map((n: any) => n.index)

    return { root, siblingNodes, path }
}
