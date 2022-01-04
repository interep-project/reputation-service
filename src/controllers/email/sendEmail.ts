import { NextApiRequest, NextApiResponse } from "next"
import { createEmailAccount, getEmailDomainsByEmail } from "src/core/email"
import { logger } from "src/utils/backend"

export default async function sendEmailController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.status(405).end()
        return
    }

    const { email } = JSON.parse(req.body)

    if (!email) {
        res.status(400).end()
        return
    }

    const emailDomains = getEmailDomainsByEmail(email)

    if (emailDomains.length === 0) {
        res.status(402).send("The email is not supported")
        return
    }

    try {
        await createEmailAccount(email, emailDomains)

        res.status(201).send({ data: true })

        logger.info(`[${req.url}] The Email account has been created`)
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
