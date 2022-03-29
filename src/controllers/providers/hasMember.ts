import { MerkleTreeNode } from "@interep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { getProviders } from "src/core/groups"
import { Provider } from "src/types/groups"
import { getCors, logger, runAPIMiddleware } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function hasMemberController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const provider = req.query?.provider as Provider
    const identityCommitment = req.query?.member as string

    if (!provider || typeof provider !== "string" || !identityCommitment || typeof identityCommitment !== "string") {
        res.status(400).end()
        return
    }

    const providers = getProviders()

    if (!providers.includes(provider)) {
        res.status(400).send("The provider does not exist")
        return
    }

    try {
        await runAPIMiddleware(req, res, getCors({ origin: "*" }))

        await connectDatabase()

        const leaf = await MerkleTreeNode.findByGroupProviderAndHash(provider, identityCommitment)

        res.status(200).send({ data: !!leaf && leaf.level === 0 })
    } catch (error) {
        logger.error(error)

        res.status(500).end()
    }
}
