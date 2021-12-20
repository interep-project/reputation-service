import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { OAuthAccount } from "@interrep/db"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

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
        await dbConnect()

        const account = await OAuthAccount.findById(session.accountId)

        if (!account) {
            res.status(500).send("Can't find account")
            return
        }

        res.status(200).send({ data: !!account.hasJoinedAGroup })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
