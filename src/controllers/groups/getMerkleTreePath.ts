import { NextApiRequest, NextApiResponse } from "next"
import { retrievePath } from "src/core/groups/mts"
import { MerkleTreeNode } from "@interrep/db"
import { Provider } from "src/types/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getMerkleTreePathController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
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

        if (!(await MerkleTreeNode.findByGroupAndHash({ name, provider }, identityCommitment))) {
            return res.status(404).send("The identity commitment does not exist")
        }

        const path = await retrievePath(provider as Provider, name as any, identityCommitment)

        if (!path) {
            return res.status(200).send({ data: [] })
        }

        return res.status(200).send({ data: path })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
