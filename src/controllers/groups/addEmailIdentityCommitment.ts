import { sha256 } from "@interrep/telegram-bot"
// import { EmailUser } from "@interrep/db" // local 
import EmailUser from "../../models/emailUser/EmailUser.model"
import { NextApiRequest, NextApiResponse } from "next"
import { addIdentityCommitment } from "src/core/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function addEmailIdentityCommitmentController(req: NextApiRequest, res: NextApiResponse) {
    const name = req.query?.name
    const identityCommitment = req.query?.identityCommitment
    const { emailUserId, emailUserToken } = JSON.parse(req.body)

    console.log("name", name)
    console.log("identityCommitment", identityCommitment)
    console.log("emailUserId", emailUserId)
    if (
        !name ||
        typeof name !== "string" ||
        !identityCommitment ||
        typeof identityCommitment !== "string" ||
        !emailUserId
    ) {
        return res.status(400).end()
    }

    // const hashId = sha256(emailUserId + name)
    // const emailUser = await EmailUser.findByHashId(hashId)
    const emailUser = await EmailUser.findByHashId(emailUserId)
    console.log(emailUser)

    if (!emailUser) {
        return res.status(403).end()
    }

    try {
        if (emailUser.joined) {
            throw new Error(`Email user already joined this group`)
        }

        await dbConnect()

        // check if emailUserToken is same as in db if not fail if so change to verified and continue
        
        // already being verified shouldn't be a problem as that will change at the same
        // time the joined changes which will not allow duplicates

        if (emailUser.emailRandomToken === emailUserToken) {
            // not verified and random token matches
            logger.silly(`Adding identity commitment ${identityCommitment} to the tree of the Email group ${name}`)

            await addIdentityCommitment("email", name, identityCommitment)
    
            console.log("added id commit")
            emailUser.verified = true
            emailUser.joined = true
    
            await emailUser.save()
    
            return res.status(201).send({ data: true })
    
        } else {
            await emailUser.save()
            return res.status(405).end()
        }
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
