import { NextApiRequest, NextApiResponse } from "next"
import { getGroup } from "src/core/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getGroupController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const groupId = req.query?.groupId

    if (!groupId || typeof groupId !== "string") {
        return res.status(400).end()
    }

    try {
        await dbConnect()

        const group = await getGroup(groupId)

        return res.status(200).send({ data: group })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
