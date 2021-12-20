import { MerkleTreeRootBatch } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"
import removeDBFields from "src/utils/backend/removeDBFields"

export default async function getRootBatchesController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    try {
        await dbConnect()

        const rootBatches = await MerkleTreeRootBatch.find()

        res.status(200).send({
            data: rootBatches.map((rootBatch) => removeDBFields(rootBatch.toJSON()))
        })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
