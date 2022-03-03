import { NextApiRequest, NextApiResponse } from "next"
import { checkGroup, getGroup } from "src/core/groups"
import { GroupName, Provider } from "src/types/groups"
import { getCors, logger, runAPIMiddleware } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function getGroupController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const provider = req.query?.provider as Provider
    const name = req.query?.name as GroupName

    if (!provider || typeof provider !== "string" || !name || typeof name !== "string") {
        res.status(400).end()
        return
    }

    if (!checkGroup(provider, name)) {
        res.status(404).end("The group does not exist")
        return
    }

    try {
        await runAPIMiddleware(req, res, getCors({ origin: "*" }))

        await connectDatabase()

        const group = await getGroup(provider, name)

        res.status(200).send({ data: group })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
