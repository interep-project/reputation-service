import { Token } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { mintToken } from "src/core/badges"
import { connectDatabase } from "src/utils/backend/database"
import { logger } from "src/utils/backend"
import { capitalize } from "src/utils/common"

export default async function mintTokenController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.status(405).end()
        return
    }

    const tokenId = req.query?.tokenId
    const { accountId } = JSON.parse(req.body)

    if (!tokenId || typeof tokenId !== "string" || !accountId) {
        res.status(400).end()
        return
    }

    const session = await getSession({ req })

    if (!session) {
        res.status(401).end()
        return
    }

    if (session.accountId !== accountId) {
        res.status(403).end()
        return
    }

    try {
        await connectDatabase()

        const token = await Token.findById(tokenId)

        if (!token) {
            res.status(404).end("The token does not exist")
            return
        }

        await mintToken(token)

        res.status(200).send({ data: true })

        logger.info(`[${req.url}] The ${capitalize(token.provider)} token ${token.tokenId} has been minted`)
    } catch (error) {
        res.status(500).send(error)

        logger.error(error)
    }
}
