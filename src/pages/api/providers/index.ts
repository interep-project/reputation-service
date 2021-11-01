import { withSentry } from "@sentry/nextjs"
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { getProviders } from "src/core/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    await dbConnect()

    if (req.method !== "GET") {
        return res.status(405).end()
    }

    try {
        const providers = getProviders()

        return res.status(200).send({ data: providers })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}

export default withSentry(handler as NextApiHandler)
