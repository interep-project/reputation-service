import { NextApiRequest, NextApiResponse } from "next"
import { MerkleTreeNode } from "@interrep/db"
import { Provider } from "src/types/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"
import { checkGroup } from "src/core/groups"
import { createProof } from "src/core/groups/mts"

export default async function getMerkleTreeProofController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
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

    if (!checkGroup(provider as Provider, name)) {
        return res.status(404).end("The group does not exist")
    }

    try {
        await dbConnect()

        if (!(await MerkleTreeNode.findByGroupAndHash({ name, provider }, identityCommitment))) {
            return res.status(404).send("The identity commitment does not exist")
        }

        const proof = await createProof(provider as Provider, name as any, identityCommitment)

        if (!proof) {
            return res.status(200).send({ data: [] })
        }

        return res.status(200).send({ data: proof })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
