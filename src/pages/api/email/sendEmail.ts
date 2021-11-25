import { withSentry } from "@sentry/nextjs"
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import createEmailAccount from "src/core/email/createEmailAccount"
import logger from "src/utils/backend/logger"
import checkEmailAddress from "src/core/email/emailAddressChecker"

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
        return res.status(405).end()
    }

    const { email } = JSON.parse(req.body)

    if (!email) {
        return res.status(400).end()
    }

    const groupId = checkEmailAddress(email)

    if (!groupId) {
        return res.status(402).send("Invalid email, must be from registered domains.")
    }

    try {
        logger.silly("Creating email account")

        await createEmailAccount(email, groupId)

        return res.status(200).send({ data: true })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}

export default withSentry(handler as NextApiHandler)
