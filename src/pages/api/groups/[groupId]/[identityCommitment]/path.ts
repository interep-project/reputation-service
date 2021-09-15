import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { withSentry } from "@sentry/nextjs"
import { dbConnect } from "src/utils/server/database"
import logger from "src/utils/server/logger"
import MerkleTreeController from "src/controllers/MerkleTreeController"
import { MerkleTreeNode } from "src/models/merkleTree/MerkleTree.model"

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    await dbConnect()

    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const groupId = req.query?.groupId
    const identityCommitment = req.query?.identityCommitment

    if (!groupId || typeof groupId !== "string" || !identityCommitment || typeof identityCommitment !== "string") {
        return res.status(400).end()
    }

    try {
        if (!(await MerkleTreeNode.findByGroupIdAndHash(groupId, identityCommitment))) {
            return res.status(400).send("The identity commitment does not exist")
        }

        const path = await MerkleTreeController.retrievePath(groupId, identityCommitment)

        if (!path) {
            return res.status(200).send({ data: [] })
        }

        return res.status(200).send({ data: path })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}

export default withSentry(handler as NextApiHandler)
