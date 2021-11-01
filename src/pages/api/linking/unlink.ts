import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { withSentry } from "@sentry/nextjs"
import jwt, { JWT } from "next-auth/jwt"
import config from "src/config"
import unlinkAccounts from "src/core/linking/unlink"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    await dbConnect()

    let jwToken: JWT

    try {
        jwToken = (await jwt.getToken({
            req,
            secret: config.JWT_SECRET
        })) as JWT
    } catch (err) {
        logger.error(err)
        return res.status(500).end()
    }

    const accountIdFromSession = jwToken.accountId

    if (!accountIdFromSession) {
        return res.status(403).send("No account id from session. User might not be logged in")
    }

    const { decryptedAttestation } = JSON.parse(req.body)

    try {
        await unlinkAccounts({
            accountIdFromSession,
            decryptedAttestation
        })

        return res.status(200).send({ data: true })
    } catch (err) {
        logger.error(err)

        return res.status(500).end()
    }
}

export default withSentry(handler as NextApiHandler)
