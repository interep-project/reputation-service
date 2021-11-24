import { sha256 } from "@interrep/telegram-bot"
import { NextApiRequest, NextApiResponse } from "next"
import { addIdentityCommitment } from "src/core/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"
import EmailUser from "../../models/emailUser/EmailUser.model"

export default async function handleEmailIdentityCommitmentController(req: NextApiRequest, res: NextApiResponse) {
    const name = req.query?.name
    const identityCommitment = req.query?.identityCommitment
    const { emailUserId, emailUserToken } = JSON.parse(req.body)

    if (
        !name ||
        typeof name !== "string" ||
        !identityCommitment ||
        typeof identityCommitment !== "string" ||
        !emailUserId
    ) {
        return res.status(400).end()
    }

    try {
        await dbConnect()

        const hashId = sha256(emailUserId + name)
        const emailUser = await EmailUser.findByHashId(hashId)

        if (!emailUser) {
            return res.status(403).end()
        }

        if (emailUser.joined) {
            throw new Error(`Email user already joined this group`)
        }

        // Check if emailUserToken is same as in db if not fail if so change to verified and continue
        // already being verified shouldn't be a problem as that will change at the same
        // time the joined changes which will not allow duplicates

        if (emailUser.emailRandomToken === emailUserToken) {
            // Not verified and random token matches.

            await addIdentityCommitment("email", name, identityCommitment)

            emailUser.joined = true

            await emailUser.save()

            return res.status(201).send({ data: true })
        }

        return res.status(405).end()
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
