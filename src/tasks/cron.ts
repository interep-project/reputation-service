import { MerkleTreeNode, MerkleTreeRootBatch, MerkleTreeRootBatchDocument } from "@interep/db"
import schedule from "node-schedule"
import config from "src/config"
import { updateGroups, retrieveEvents } from "src/core/contracts/Interep"
import { GroupName, Provider } from "src/types/groups"
import { logger } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export async function run() {
    await connectDatabase()

    schedule.scheduleJob(`*/${config.CRON_INTERVAL} * * * *`, { tz: "Europe/Rome" }, async () => {
        try {
            const events = await retrieveEvents("GroupUpdated")

            // Get all the new db root nodes not yet published onchain.
            const merkleRoots = await MerkleTreeNode.find({
                siblingHash: undefined,
                hash: { $nin: events.map((e) => e.root.toString()) }
            })

            // If there are new db root hashes, publish them.
            if (merkleRoots && merkleRoots.length > 0) {
                const groupProviders = merkleRoots.map((e) => e.group.provider) as Provider[]
                const groupNames = merkleRoots.map((e) => e.group.name) as GroupName[]
                const roots = merkleRoots.map((e) => e.hash)

                const transaction = await updateGroups(groupProviders, groupNames, roots)

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

                logger.info(`The Merkle roots have been published on-chain (${merkleRoots.length})`)
            }
        } catch (error: any) {
            logger.error(`Cron error: ${error.message}`)
        }
    })
}
