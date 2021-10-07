import { NextApiRequest, NextApiResponse } from "next"
import { getGroups } from "src/core/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getGroupsController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    try {
        await dbConnect()

        const groups = await getGroups()

        return res.status(200).send({ data: groups })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
