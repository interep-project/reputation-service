import { MerkleTreeRootBatch, MerkleTreeRootBatchData } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getMerkleTreeRootBatchesController(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const rootHash = req.query?.rootHash

    if (rootHash && typeof rootHash !== "string") {
        return res.status(400).end()
    }

    try {
        await dbConnect()

        if (rootHash) {
            const rootBatch = await MerkleTreeRootBatch.findOne({
                rootHashes: { $elemMatch: { $eq: rootHash } }
            })

            if (!rootBatch) {
                return res.status(404).end("The Merkle root does not exist")
            }

            return res.status(200).send({
                data: {
                    group: rootBatch.group,
                    rootHashes: rootBatch.rootHashes,
                    transaction: rootBatch.transaction
                } as MerkleTreeRootBatchData
            })
        }

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
