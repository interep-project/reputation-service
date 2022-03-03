import { NextApiRequest, NextApiResponse } from "next"
import { getGroups } from "src/core/groups"
import { connectDatabase } from "src/utils/backend/database"
import { getCors, logger, runAPIMiddleware } from "src/utils/backend"

export default async function getGroupsController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    try {
        await runAPIMiddleware(req, res, getCors({ origin: "*" }))

        await connectDatabase()

        const groups = await getGroups()

        res.status(200).send({ data: groups })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
