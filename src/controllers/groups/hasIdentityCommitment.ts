import { NextApiRequest, NextApiResponse } from "next"
import { MerkleTreeNode } from "@interrep/db"
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

    const provider = req.query?.provider as Provider
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

        const node = await MerkleTreeNode.findByGroupAndHash({ name, provider }, identityCommitment)

        return res.status(200).send({ data: !!node && node.level === 0 })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
