import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { withSentry } from "@sentry/nextjs"
import { getSession } from "next-auth/client"
import linkAccounts from "src/core/linking"
import { Token } from "@interrep/data-models"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    await dbConnect()

    if (req.method !== "PUT") {
        return res.status(405).end()
    }

    const session = await getSession({ req })
    if (!session) {
        return res.status(401).end()
    }

    const { address, web2AccountId, userSignature, userPublicKey } = JSON.parse(req.body)

    logger.silly(`Linking ${address} with ${web2AccountId}. Signature: ${userSignature}`)

    // Invalid call
    if (!address || !web2AccountId || !userSignature || !userPublicKey) {
        return res.status(400).end()
    }

    // Check if user is connected with the web 2 account to be linked
    if (session.web2AccountId !== web2AccountId) {
        return res.status(403).end()
    }

    try {
        const token = await linkAccounts({
            address,
            web2AccountId,
            userSignature,
            userPublicKey
        })

        return token instanceof Token ? res.status(201).send({ data: token.toJSON() }) : res.status(500).end()
    } catch (err) {
        logger.error(err)
        return res.status(400).end()
    }
}

export default withSentry(handler as NextApiHandler)
