import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { withSentry } from "@sentry/nextjs"
import { dbConnect } from "src/utils/server/database"
import logger from "src/utils/server/logger"
import { getGroup } from "src/core/groups"

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    await dbConnect()

    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const groupId = req.query?.groupId

    if (!groupId || typeof groupId !== "string") {
        return res.status(400).end()
    }

    try {
        const group = await getGroup(groupId)

        return res.status(200).send({ data: group })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}

export default withSentry(handler as NextApiHandler)
