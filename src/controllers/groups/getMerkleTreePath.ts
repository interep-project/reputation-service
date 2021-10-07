import { NextApiRequest, NextApiResponse } from "next"
import { retrievePath } from "src/core/groups/mts"
import { MerkleTreeNode } from "src/models/merkleTree/MerkleTree.model"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getMerkleTreePathController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
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

        if (!(await MerkleTreeNode.findByGroupIdAndHash(groupId, identityCommitment))) {
            return res.status(404).send("The identity commitment does not exist")
        }

        const path = await retrievePath(groupId, identityCommitment)

        if (!path) {
            return res.status(200).send({ data: [] })
        }

        return res.status(200).send({ data: path })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
