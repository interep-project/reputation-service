import { MerkleTreeNode } from "@interep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { checkGroup } from "src/core/groups"
import { createProof } from "src/core/groups/mts"
import { GroupName, Provider } from "src/types/groups"
import { getCors, logger, runAPIMiddleware } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function getMerkleProofController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const provider = req.query?.provider as Provider
    const name = req.query?.name as GroupName
    const member = req.query?.member

    if (
        !provider ||
        typeof provider !== "string" ||
        !name ||
        typeof name !== "string" ||
        !member ||
        typeof member !== "string"
    ) {
        res.status(400).end()
        return
    }

    if (!checkGroup(provider, name)) {
        res.status(404).end("The group does not exist")
        return
    }

    try {
        await runAPIMiddleware(req, res, getCors({ origin: "*" }))

        await connectDatabase()

        if (!(await MerkleTreeNode.findByGroupAndHash({ name, provider }, member))) {
            res.status(404).send("The identity commitment does not exist")
            return
        }

        const proof = await createProof(provider, name, member)

        res.status(200).send({ data: proof })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
