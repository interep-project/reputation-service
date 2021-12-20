import { NextApiRequest, NextApiResponse } from "next"
import { getProviders } from "src/core/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getProvidersController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    try {
        await dbConnect()

        const providers = getProviders()

        res.status(200).send({ data: providers })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
