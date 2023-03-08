import { MerkleTreeNode } from "@interep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { checkGroup } from "src/core/groups"
import { GroupName, Provider } from "src/types/groups"
import { getCors, logger, runAPIMiddleware } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function getGroupRemovedMembersController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const provider = req.query?.provider as Provider
    const name = req.query?.name as GroupName
    const limit = req.query?.limit
    const offset = req.query?.offset

    if (
        !provider ||
        typeof provider !== "string" ||
        !name ||
        typeof name !== "string" ||
        (limit && (typeof limit !== "string" || Number.isNaN(limit))) ||
        (offset && (typeof offset !== "string" || Number.isNaN(offset)))
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

        const zeroLeaves = await MerkleTreeNode.find({ group: { provider, name }, level: 0, hash: "0" })
            .sort({ $natural: -1 })
            .skip(Number(offset || 0))
            .limit(Number(limit || 0))

        res.status(200).send({ data: zeroLeaves.map((leaf) => leaf.index).reverse() })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
