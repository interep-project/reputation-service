import { EmailUser } from "@interrep/db"
import { dbConnect } from "src/utils/backend/database"
import { sha256 } from "src/utils/common/crypto"
import EmailDomain from "./emailDomain"
import sendEmail from "./sendEmail"

export default async function createEmailAccount(email: string, emailDomains: EmailDomain[]): Promise<void> {
    try {
        await dbConnect()

        let verificationToken = sha256(Math.floor(Math.random() * 10000).toString())

        for (let i = emailDomains.length - 1; i >= 0; i--) {
            const hashId = sha256(email + emailDomains[i])

            let account = await EmailUser.findByHashId(hashId)

            if (!account) {
                account = new EmailUser({
                    hashId,
                    hasJoined: false,
                    verificationToken
                })
            } else {
                verificationToken = account.verificationToken
            }

            await account.save()
        }

        try {
            await sendEmail(email, verificationToken, emailDomains)
        } catch (error) {
            throw new Error(`Error trying to send the magic link: ${error}`)
        }
    } catch (error) {
        throw new Error(`Error trying to create the email account: ${error}`)
    }
}
