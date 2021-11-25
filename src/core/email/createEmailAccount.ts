import { EmailUser } from "@interrep/db"
import { dbConnect } from "src/utils/backend/database"
import { sha256 } from "src/utils/common/crypto"
import sendEmail from "./sendEmail"

export default async function createEmailAccount(email: string, groupId: string): Promise<void> {
    try {
        await dbConnect()

        const hashId = sha256(email + groupId)
        const verificationToken = Math.floor(Math.random() * 10000).toString()

        let account = await EmailUser.findByHashId(hashId)

        if (!account) {
            account = new EmailUser({
                hashId,
                hasJoined: false,
                verificationToken
            })
        } else if (!account.hasJoined) {
            account.verificationToken = verificationToken
        }

        await account.save()

        try {
            await sendEmail(email, verificationToken, groupId)
        } catch (error) {
            throw new Error(`Error trying to send the magic link: ${error}`)
        }
    } catch (error) {
        throw new Error(`Error trying to create the email account: ${error}`)
    }
}
