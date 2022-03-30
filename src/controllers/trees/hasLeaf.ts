import { MerkleTreeNode } from "@interep/db"
import { NextApiRequest, NextApiResponse } from "next"
import config from "src/config"
import { getCors, logger, runAPIMiddleware } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function hasLeafController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const root = req.query?.root
    const leaf = req.query?.leaf

    if (!root || typeof root !== "string" || !leaf || typeof leaf !== "string") {
        res.status(400).end()
        return
    }

    try {
        await runAPIMiddleware(req, res, getCors({ origin: "*" }))

        await connectDatabase()

        const rootNode = await MerkleTreeNode.findOne({ hash: root })

        if (!rootNode || rootNode.level !== config.MERKLE_TREE_DEPTH) {
            res.status(404).end("The root does not exist")
            return
        }

        const leafNode = await MerkleTreeNode.findOne({ hash: leaf })

        res.status(200).send({
            data:
                !!leafNode &&
                leafNode.level === 0 &&
                rootNode.group.provider === leafNode.group.provider &&
                rootNode.group.name === leafNode.group.name
        })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
