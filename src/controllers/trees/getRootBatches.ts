import { MerkleTreeRootBatch, MerkleTreeRootBatchData } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getRootBatchesController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    try {
        await dbConnect()

        const rootBatches = await MerkleTreeRootBatch.find()

        return res.status(200).send({
            data: rootBatches.map((rootBatch) => ({
                group: rootBatch.group,
                rootHashes: rootBatch.rootHashes,
                transaction: rootBatch.transaction
            })) as MerkleTreeRootBatchData[]
        })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
