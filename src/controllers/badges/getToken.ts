import { Token } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { logger, removeDBFields } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function getTokenController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const tokenId = req.query?.tokenId

    if (!tokenId || typeof tokenId !== "string") {
        res.status(400).end()
        return
    }

    try {
        await connectDatabase()

        const token = await Token.findById(tokenId)

        if (!token) {
            throw new Error(`Token with id ${tokenId} not found`)
        }

        res.status(200).send({ data: removeDBFields(token.toJSON()) })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
