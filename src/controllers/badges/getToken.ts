import { NextApiRequest, NextApiResponse } from "next"
import { Token } from "@interrep/db"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getTokenController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const tokenId = req.query?.tokenId

    if (!tokenId || typeof tokenId !== "string") {
        return res.status(400).end()
    }

    try {
        await dbConnect()

        const token = await Token.findById(tokenId)

        if (!token) {
            return res.status(500).send(`Token with id ${tokenId} not found`)
        }

        return res.status(200).send({ data: token.toJSON() })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
