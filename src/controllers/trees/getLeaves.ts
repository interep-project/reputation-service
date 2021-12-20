import { MerkleTreeNode } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getLeavesController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const rootHash = req.query?.rootHash
    const limit = req.query?.limit
    const offset = req.query?.offset

    if (
        !rootHash ||
        typeof rootHash !== "string" ||
        (limit && (typeof limit !== "string" || Number.isNaN(limit))) ||
        (offset && (typeof offset !== "string" || Number.isNaN(offset)))
    ) {
        res.status(400).end()
        return
    }

    try {
        await dbConnect()

        const root = await MerkleTreeNode.findOne({ hash: rootHash })

        if (!root) {
            res.status(404).end("The root does not exist")
            return
        }

        const leaves = await MerkleTreeNode.find({ group: root.group, level: 0 })
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
