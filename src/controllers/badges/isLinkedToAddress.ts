import { OAuthAccount } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function isLinkedToAddressController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    try {
        await dbConnect()

        const session = await getSession({ req })

        if (!session) {
            return res.status(401).end()
        }

        const account = await OAuthAccount.findById(session.accountId)

        if (!account) {
            return res.status(404).send("Can't find account")
        }

        return res.status(200).send({ data: account.isLinkedToAddress })
    } catch (err) {
        logger.error(err)
        return res.status(500).end()
    }
}
