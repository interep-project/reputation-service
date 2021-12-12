import { MerkleTreeNode } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getMerkleTreeLeavesController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const rootHash = req.query?.rootHash
    const limit = req.query?.limit

    if (!rootHash || typeof rootHash !== "string" || (limit && (typeof limit !== "string" || Number.isNaN(limit)))) {
        return res.status(400).end()
    }

    try {
        await dbConnect()

        const root = await MerkleTreeNode.findOne({ hash: rootHash })

        if (!root) {
            return res.status(404).end("The root does not exist")
        }

        const leaves = await MerkleTreeNode.find({ group: root.group, level: 0 })
            .sort({ $natural: -1 })
            .limit(Number(limit || 0))

        return res.status(200).send({
            data: leaves.map((leave) => leave.hash).reverse()
        })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
