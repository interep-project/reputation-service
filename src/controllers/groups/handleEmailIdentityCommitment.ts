import { EmailUser } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { addIdentityCommitment, deleteIdentityCommitment } from "src/core/contracts/Groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"
import { sha256 } from "src/utils/common/crypto"

export default async function handleEmailIdentityCommitmentController(req: NextApiRequest, res: NextApiResponse) {
    const name = req.query?.name
    const identityCommitment = req.query?.identityCommitment
    const { emailUserId, emailUserToken } = JSON.parse(req.body)

    if (
        !name ||
        typeof name !== "string" ||
        !identityCommitment ||
        typeof identityCommitment !== "string" ||
        !emailUserId ||
        !emailUserToken
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

        // Check if the user has the right token.
        if (emailUser.verificationToken !== emailUserToken) {
            return res.status(401).end()
        }

        if (req.method === "POST") {
            if (emailUser.hasJoined) {
                throw new Error(`Email user already joined this group`)
            }

            await addIdentityCommitment("email", name, identityCommitment)

            emailUser.hasJoined = true
        } else if (req.method === "DELETE") {
            if (!emailUser.hasJoined) {
                throw new Error(`Email user has not joined this group yet`)
            }

            await deleteIdentityCommitment("email", name, identityCommitment)

            emailUser.hasJoined = false
        }

        await emailUser.save()

        return res.status(201).send({ data: true })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
