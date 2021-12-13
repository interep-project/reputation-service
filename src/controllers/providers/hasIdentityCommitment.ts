import { MerkleTreeNode } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
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
    const identityCommitment = req.query?.identityCommitment

    if (!provider || typeof provider !== "string" || !identityCommitment || typeof identityCommitment !== "string") {
        return res.status(400).end()
    }

    try {
        await dbConnect()

        const leaf = await MerkleTreeNode.findByGroupProviderAndHash(provider as Provider, identityCommitment)

        return res.status(200).send({ data: !!leaf && leaf.level === 0 })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
