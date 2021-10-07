import { NextApiRequest, NextApiResponse } from "next"
import { getGroupId } from "src/core/groups"
import { MerkleTreeNode } from "src/models/merkleTree/MerkleTree.model"
import { Provider } from "src/types/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function hasIdentityCommitmentController(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const provider = req.query?.provider
    const name = req.query?.name
    const identityCommitment = req.query?.identityCommitment

    if (
        !provider ||
        typeof provider !== "string" ||
        !name ||
        typeof name !== "string" ||
        !identityCommitment ||
        typeof identityCommitment !== "string"
    ) {
        return res.status(400).end()
    }

    try {
        await dbConnect()

        const groupId = getGroupId(provider as Provider, name as any)
        const node = await MerkleTreeNode.findByGroupIdAndHash(groupId, identityCommitment)

        return res.status(200).send({ data: !!node && node.key.level === 0 })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
