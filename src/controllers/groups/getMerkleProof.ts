import { MerkleTreeNode } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { checkGroup } from "src/core/groups"
import { createProof } from "src/core/groups/mts"
import { Provider } from "src/types/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getMerkleProofController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
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
        res.status(400).end()
        return
    }

    if (!checkGroup(provider as Provider, name)) {
        res.status(404).end("The group does not exist")
        return
    }

    try {
        await dbConnect()

        if (!(await MerkleTreeNode.findByGroupAndHash({ name, provider }, identityCommitment))) {
            res.status(404).send("The identity commitment does not exist")
            return
        }

        const proof = await createProof(provider as Provider, name, identityCommitment)

        if (!proof) {
            res.status(200).send({ data: [] })
            return
        }

        res.status(200).send({ data: proof })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
