import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { withSentry } from "@sentry/nextjs"
import { getSession } from "next-auth/client"
import { OAuthAccount } from "@interrep/data-models"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    await dbConnect()

    if (req.method !== "GET") {
        return res.status(405).end()
    }

    try {
        const session = await getSession({ req })

        if (!session) {
            return res.status(401).end()
        }

        const account = await OAuthAccount.findById(session.accountId)

        if (!account) {
            return res.status(500).send("Can't find account")
        }

        return res.status(200).send({ data: account.isLinkedToAddress })
    } catch (err) {
        logger.error(err)
        return res.status(500).send("Error while verifying if account is linked")
    }
}

export default withSentry(handler as NextApiHandler)
