import { NextApiRequest, NextApiResponse } from "next"
import { getGroup } from "src/core/groups"
import { Provider } from "src/types/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getGroupController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const provider = req.query?.provider
    const reputationOrName = req.query?.reputationOrName

    if (!provider || typeof provider !== "string" || !reputationOrName || typeof reputationOrName !== "string") {
        return res.status(400).end()
    }

    try {
        await dbConnect()

        const group = await getGroup(provider as Provider, reputationOrName as any)

        return res.status(200).send({ data: group })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
