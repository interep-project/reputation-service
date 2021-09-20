import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { withSentry } from "@sentry/nextjs"
import { dbConnect } from "src/utils/server/database"
import jwt from "next-auth/jwt"
import config from "src/config"
import logger from "src/utils/server/logger"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import { Web2Providers } from "src/models/web2Accounts/Web2Account.types"

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    await dbConnect()

    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const platform = req.query?.platform

    if (!platform || typeof platform !== "string") {
        return res.status(400).end()
    }

    try {
        const token = await jwt.getToken({
            req,
            secret: config.JWT_SECRET
        })

        if (!token?.user?.id) {
            return res.status(401).end()
        }

        const web2Account = await Web2Account.findByProviderAccountId(
            (platform as unknown) as Web2Providers,
            token.user.id
        )

        if (!web2Account) {
            return res.status(404).end()
        }

        return res.status(200).send({ data: web2Account.basicReputation })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}

export default withSentry(handler as NextApiHandler)
