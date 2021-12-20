import { MerkleTreeRootBatch } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"
import removeDBFields from "src/utils/backend/removeDBFields"

export default async function getRootBatchController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const rootHash = req.query?.rootHash

    if (!rootHash || typeof rootHash !== "string") {
        res.status(400).end()
        return
    }

    try {
        await dbConnect()

        const rootBatch = await MerkleTreeRootBatch.findOne({
            rootHashes: { $elemMatch: { $eq: rootHash } }
        })

        if (!rootBatch) {
            res.status(404).end("The Merkle root does not exist")
            return
        }

        res.status(200).send({
            data: removeDBFields(rootBatch.toJSON())
        })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
