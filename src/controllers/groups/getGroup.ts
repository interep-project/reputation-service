import { NextApiRequest, NextApiResponse } from "next"
import { checkGroup, getGroup } from "src/core/groups"
import { Provider } from "src/types/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getGroupController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const provider = req.query?.provider
    const name = req.query?.name

    if (!provider || typeof provider !== "string" || !name || typeof name !== "string") {
        return res.status(400).end()
    }

    if (!checkGroup(provider as Provider, name)) {
        return res.status(404).end("The group does not exist")
    }

    try {
        await dbConnect()

        const group = await getGroup(provider as Provider, name as any)

        return res.status(200).send({ data: group })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
