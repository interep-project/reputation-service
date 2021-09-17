import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { withSentry } from "@sentry/nextjs"
import jwt, { JWT } from "next-auth/jwt"
import config from "src/config"
import unlinkAccounts from "src/core/linking/unlink"
import { dbConnect } from "src/utils/server/database"
import logger from "src/utils/server/logger"

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    await dbConnect()

    let jwToken: JWT

    try {
        // @ts-ignore: secret exists
        jwToken = await jwt.getToken({
            req,
            secret: config.JWT_SECRET
        })
    } catch (err) {
        logger.error(err)
        return res.status(500).end()
    }

    const web2AccountIdFromSession = jwToken.web2AccountId

    if (!web2AccountIdFromSession) {
        return res.status(403).send("No web 2 account id from session. User might not be logged in")
    }

    const { decryptedAttestation } = JSON.parse(req.body)

    try {
        await unlinkAccounts({
            web2AccountIdFromSession,
            decryptedAttestation
        })

        return res.status(200).end()
    } catch (err) {
        logger.error(err)

        return res.status(500).end()
    }
}

export default withSentry(handler as NextApiHandler)
