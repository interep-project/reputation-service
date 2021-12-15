import { Token } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { linkAccounts } from "src/core/badges"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function linkAccountsController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "PUT") {
        return res.status(405).end()
    }

    const session = await getSession({ req })

    if (!session) {
        return res.status(401).end()
    }

    const { userAddress, accountId, userSignature, userPublicKey } = JSON.parse(req.body)

    if (!userAddress || !accountId || !userSignature || !userPublicKey) {
        return res.status(400).end()
    }

    if (session.accountId !== accountId) {
        return res.status(403).end()
    }

    try {
        await dbConnect()

        const token = await linkAccounts(userAddress, userSignature, userPublicKey, accountId)

        return token instanceof Token ? res.status(201).send({ data: token.toJSON() }) : res.status(500).end()
    } catch (err) {
        logger.error(err)
        return res.status(400).end()
    }
}
