import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { withSentry } from "@sentry/nextjs"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"
import { MerkleTreeNode } from "src/models/merkleTree/MerkleTree.model"
import { getGroupIds } from "src/core/groups"
import { Provider } from "src/types/groups"

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    await dbConnect()

    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const provider = req.query?.provider
    const identityCommitment = req.query?.identityCommitment

    if (!provider || typeof provider !== "string" || !identityCommitment || typeof identityCommitment !== "string") {
        return res.status(400).end()
    }

    try {
        const groupIds = getGroupIds(provider as Provider)

        for (const groupId of groupIds) {
            const node = await MerkleTreeNode.findByGroupIdAndHash(groupId, identityCommitment)

            if (node && node.key.level === 0) {
                return res.status(200).send({ data: true })
            }
        }

        return res.status(200).send({ data: false })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}

export default withSentry(handler as NextApiHandler)
