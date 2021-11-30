import { NextApiRequest, NextApiResponse } from "next"
// import createEmailAccount from "src/core/email/createEmailAccount"
import { createEmailAccount, checkEmailAddress } from "src/core/email"
import logger from "src/utils/backend/logger"

export default async function sendEmailController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
        return res.status(405).end()
    }

    const { email } = JSON.parse(req.body)

    if (!email) {
        return res.status(400).end()
    }

    const groupId = checkEmailAddress(email)

    if (groupId.length === 0) {
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
