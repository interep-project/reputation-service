import { EmailUser } from "@interrep/db"
import { sha256 } from "src/utils/common/crypto"
import EmailDomain from "./emailDomain"
import sendEmail from "./sendEmail"

export default async function createEmailAccount(email: string, emailDomains: EmailDomain[]): Promise<void> {
    let verificationToken = sha256(Math.floor(Math.random() * 10000).toString())

    for (let i = emailDomains.length - 1; i >= 0; i--) {
        const hashId = sha256(email + emailDomains[i])
        const account = await EmailUser.findByHashId(hashId)

        if (!account) {
            await EmailUser.create({
                hashId,
                hasJoined: false,
                verificationToken
            })
        } else {
            verificationToken = account.verificationToken
        }
    }

    await sendEmail(email, verificationToken, emailDomains)
}
