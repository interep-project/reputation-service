import { OAuthAccount } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { logger } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function hasJoinedAGroupController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const session = await getSession({ req })

    if (!session) {
        res.status(401).end()
        return
    }

    try {
        await connectDatabase()

        const account = await OAuthAccount.findById(session.accountId)

        if (!account) {
            throw new Error("The account does not exist")
        }

        res.status(200).send({ data: !!account.hasJoinedAGroup })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
