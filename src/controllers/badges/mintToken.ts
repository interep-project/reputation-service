import { Token } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { mintToken } from "src/core/badges"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function mintTokenController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
        return res.status(405).end()
    }

    const tokenId = req.query?.tokenId
    const { accountId } = JSON.parse(req.body)

    if (!tokenId || typeof tokenId !== "string" || !accountId) {
        return res.status(400).end()
    }

    const session = await getSession({ req })

    if (!session) {
        return res.status(401).end()
    }

    if (session.accountId !== accountId) {
        return res.status(403).end()
    }

    try {
        await dbConnect()

        const token = await Token.findById(tokenId)

        if (!token) {
            return res.status(404).end("The token does not exist")
        }

        await mintToken(token)

        return res.status(200).send({ data: true })
    } catch (error) {
        logger.error(error)

        return res.status(500).send(error)
    }
}
