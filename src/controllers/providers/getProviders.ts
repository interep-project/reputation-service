import { NextApiRequest, NextApiResponse } from "next"
import { getProviders } from "src/core/groups"
import { getCors, logger, runAPIMiddleware } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function getProvidersController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    try {
        await runAPIMiddleware(req, res, getCors({ origin: "*" }))

        await connectDatabase()

        const providers = getProviders()

        res.status(200).send({ data: providers })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
