import { MerkleTreeNode, MerkleTreeRootBatch, MerkleTreeRootBatchDocument } from "@interrep/db"
import config from "src/config"
import { publishOffchainMerkleRoots, retrieveEvents } from "src/core/contracts/Groups"
import { Provider } from "src/types/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"
import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler"

export async function run() {
    await dbConnect()

    const scheduler = new ToadScheduler()
    const task = new AsyncTask(
        "publish-offchain-merkle-roots",
        async () => {
            // Get all the 'OffchainMerkleRoot' onchain events.
            const events = await retrieveEvents("OffchainMerkleRoot")
            // Get all the new db root nodes not yet published onchain.
            const merkleRoots = await MerkleTreeNode.find({
                level: config.MERKLE_TREE_DEPTH,
                hash: { $nin: events.map((e) => e.root.toString()) }
            })

            // If there are new db root hashes, publish them.
            if (merkleRoots && merkleRoots.length > 0) {
                const groupProviders = merkleRoots.map((e) => e.group.provider) as Provider[]
                const groupNames = merkleRoots.map((e) => e.group.name)
                const rootHashes = merkleRoots.map((e) => e.hash)

                const transaction = await publishOffchainMerkleRoots(groupProviders, groupNames, rootHashes)

                for (let i = 0; i < merkleRoots.length; i++) {
                    const rootBatch = (await MerkleTreeRootBatch.findOne({
                        group: { provider: groupProviders[i], name: groupNames[i] },
                        transaction: undefined
                    })) as MerkleTreeRootBatchDocument

                    rootBatch.transaction = {
                        hash: transaction.transactionHash,
                        blockNumber: transaction.blockNumber
                    }

                    await rootBatch.save()
                }
            }
        },
        (error: Error) => {
            logger.error(`Cron error: ${error.message}`)
        }
    )
    const job = new SimpleIntervalJob({ days: 1, runImmediately: true }, task)

    scheduler.addSimpleIntervalJob(job)
}
