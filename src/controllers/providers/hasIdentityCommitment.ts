import { MerkleTreeNode } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { Provider } from "src/types/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function hasIdentityCommitmentController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const provider = req.query?.provider
    const identityCommitment = req.query?.identityCommitment

    if (!provider || typeof provider !== "string" || !identityCommitment || typeof identityCommitment !== "string") {
        res.status(400).end()
        return
    }

    try {
        await dbConnect()

        const leaf = await MerkleTreeNode.findByGroupProviderAndHash(provider as Provider, identityCommitment)

        res.status(200).send({ data: !!leaf && leaf.level === 0 })
    } catch (error) {
        logger.error(error)

        res.status(500).end()
    }
}
