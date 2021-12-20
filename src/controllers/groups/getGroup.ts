import { NextApiRequest, NextApiResponse } from "next"
import { checkGroup, getGroup } from "src/core/groups"
import { Provider } from "src/types/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getGroupController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const provider = req.query?.provider
    const name = req.query?.name

    if (!provider || typeof provider !== "string" || !name || typeof name !== "string") {
        res.status(400).end()
        return
    }

    if (!checkGroup(provider as Provider, name)) {
        res.status(404).end("The group does not exist")
        return
    }

    try {
        await dbConnect()

        const group = await getGroup(provider as Provider, name as any)

        res.status(200).send({ data: group })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
