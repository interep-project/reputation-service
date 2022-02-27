import { MerkleTreeNode } from "@interep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { logger } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function getLeavesController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const root = req.query?.root
    const limit = req.query?.limit
    const offset = req.query?.offset

    if (
        !root ||
        typeof root !== "string" ||
        (limit && (typeof limit !== "string" || Number.isNaN(limit))) ||
        (offset && (typeof offset !== "string" || Number.isNaN(offset)))
    ) {
        res.status(400).end()
        return
    }

    try {
        await connectDatabase()

        const rootNode = await MerkleTreeNode.findOne({ hash: root })

        if (!rootNode) {
            res.status(404).end("The root does not exist")
            return
        }

        const leaves = await MerkleTreeNode.find({ group: rootNode.group, level: 0 })
            .sort({ $natural: -1 })
            .skip(Number(offset || 0))
            .limit(Number(limit || 0))

        res.status(200).send({
            data: leaves.map((leave) => leave.hash).reverse()
        })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
