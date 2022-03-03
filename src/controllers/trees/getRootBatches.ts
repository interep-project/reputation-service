import { MerkleTreeRootBatch } from "@interep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { getCors, logger, removeDBFields, runAPIMiddleware } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function getRootBatchesController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    try {
        await runAPIMiddleware(req, res, getCors({ origin: "*" }))

        await connectDatabase()

        const rootBatches = await MerkleTreeRootBatch.find()

        res.status(200).send({
            data: rootBatches.map((rootBatch) => removeDBFields(rootBatch.toJSON()))
        })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
