import { EmailUser } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { appendLeaf, deleteLeaf } from "src/core/groups/mts"
import { GroupName } from "src/types/groups"
import { logger } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"
import { sha256 } from "src/utils/common/crypto"

export default async function handleEmailIdentityCommitmentController(req: NextApiRequest, res: NextApiResponse) {
    const name = req.query?.name as GroupName
    const identityCommitment = req.query?.identityCommitment as string
    const { emailUserId, emailUserToken } = JSON.parse(req.body)

    if (!emailUserId || !emailUserToken) {
        res.status(400).end()
        return
    }

    try {
        await connectDatabase()

        const hashId = sha256(emailUserId + name)
        const emailUser = await EmailUser.findByHashId(hashId)

        if (!emailUser) {
            res.status(403).end()
            return
        }

        // Check if the user has the right token.
        if (emailUser.verificationToken !== emailUserToken) {
            res.status(401).end()
            return
        }

        if (req.method === "POST") {
            if (emailUser.hasJoined) {
                throw new Error(`Email user already joined this group`)
            }

            await appendLeaf("email", name, identityCommitment)

            emailUser.hasJoined = true
        } else if (req.method === "DELETE") {
            if (!emailUser.hasJoined) {
                throw new Error(`Email user has not joined this group yet`)
            }

            await deleteLeaf("email", name, identityCommitment)

            emailUser.hasJoined = false
        }

        await emailUser.save()

        res.status(201).send({ data: true })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
