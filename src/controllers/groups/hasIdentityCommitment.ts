import { NextApiRequest, NextApiResponse } from "next"
import { MerkleTreeNode } from "src/models/merkleTree/MerkleTree.model"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function hasIdentityCommitmentController(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const groupId = req.query?.groupId
    const identityCommitment = req.query?.identityCommitment

    if (!groupId || typeof groupId !== "string" || !identityCommitment || typeof identityCommitment !== "string") {
        return res.status(400).end()
    }

    try {
        await dbConnect()

        const node = await MerkleTreeNode.findByGroupIdAndHash(groupId, identityCommitment)

        return res.status(200).send({ data: !!node && node.key.level === 0 })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
