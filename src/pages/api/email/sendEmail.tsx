import { withSentry } from "@sentry/nextjs"
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import createEmailAccount from "src/core/email/createEmailAccount"
import logger from "src/utils/backend/logger"

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
        return res.status(405).end()
    }

    const { email, groupId } = JSON.parse(req.body)

    if (!email) {
        return res.status(400).end()
    }

    if (!email.includes("@hotmail")) {
        console.log("hi")
        return res.status(402).send("Invalid email, it must be an @hotmail address")
    }

    try {
        logger.silly("Creating email account")

        const status = await createEmailAccount(email, groupId)
        console.log("status", status)

        if (status) {
            return res.status(200).send({ data: true })
        }

        return res.status(200).send({ data: false })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}

export default withSentry(handler as NextApiHandler)
