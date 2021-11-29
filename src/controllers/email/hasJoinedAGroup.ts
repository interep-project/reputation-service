import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { OAuthAccount } from "@interrep/db"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function hasJoinedAGroupController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const session = await getSession({ req })

    if (!session) {
        return res.status(401).end()
    }

    try {
        await dbConnect()

        const account = await OAuthAccount.findById(session.accountId)

        if (!account) {
            return res.status(500).send("Can't find account")
        }

        return res.status(200).send({ data: !!account.hasJoinedAGroup })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
