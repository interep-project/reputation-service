import { OAuthAccount } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { logger } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function isLinkedToAddressController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    try {
        await connectDatabase()

        const session = await getSession({ req })

        if (!session) {
            res.status(401).end()
            return
        }

        const account = await OAuthAccount.findById(session.accountId)

        if (!account) {
            throw new Error(`The account id does not match any account in the db`)
        }

        res.status(200).send({ data: account.isLinkedToAddress })
    } catch (err) {
        res.status(500).end()

        logger.error(err)
    }
}
