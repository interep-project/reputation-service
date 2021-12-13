import { MerkleTreeNode } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import config from "src/config"
import { createProof } from "src/core/groups/mts"
import { Provider } from "src/types/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getMerkleProofController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const rootHash = req.query?.rootHash
    const leafHash = req.query?.leafHash

    if (!rootHash || typeof rootHash !== "string" || !leafHash || typeof leafHash !== "string") {
        return res.status(400).end()
    }

    try {
        await dbConnect()

        const root = await MerkleTreeNode.findOne({ hash: rootHash })

        if (!root || root.level !== config.MERKLE_TREE_DEPTH) {
            return res.status(404).end("The root does not exist")
        }

        const leaf = await MerkleTreeNode.findOne({ hash: leafHash })

        if (!leaf || leaf.level !== 0) {
            return res.status(404).end("The leaf does not exist")
        }

        const proof = await createProof(root.group.provider as Provider, root.group.name, leafHash)

        if (!proof) {
            return res.status(200).send({ data: [] })
        }

        return res.status(200).send({ data: proof })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
