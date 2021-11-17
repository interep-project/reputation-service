import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"
import EmailUser from "../../models/emailUser/EmailUser.model"
import sendEmail from "./sendEmail"

export default async function createEmailAccount(hashId: string, provider: String): Promise<string | void> {
    await dbConnect()

    let verified = false

    logger.silly(`making account ${hashId}`)

    try {
        let account = await EmailUser.findByHashId(hashId) // not sure if this is right info
        const randEmailToken = Math.floor(Math.random() * 10000)

        logger.silly(`account ${JSON.stringify(account)}`)

        if (!account) {
            // account doesn't exist, make one and then send email
            logger.silly("no account present")
            account = new EmailUser({
                provider,
                hashId,
                verified: false,
                joined: false,
                emailRandomToken: randEmailToken
            })
        } else {
            logger.silly("account exists")

            // Account does exist see if it's verified if not update emailRandomToken and send email.
            //
            verified = account.verified

            if (!verified) {
                account.emailRandomToken = String(randEmailToken)
            }

            logger.silly(`verified ${verified}`)
        }

        try {
            await account.save()

            // Save new account info and then send email if account not verified.
            if (!verified) {
                logger.silly("account not verified yet")
                try {
                    logger.silly("trying to send email")

                    return await sendEmail(hashId, String(randEmailToken)).then((result) => {
                        logger.silly("sendEmail message internal", result)
                        return result
                    })
                } catch (error) {
                    throw new Error(`Error trying to save the account: ${error}`)
                }
            } else {
                // Account is already verified.
                return "address already verified"
            }
        } catch (error) {
            throw new Error(`Error trying to save the account: ${error}`)
        }
    } catch (error) {
        throw new Error(`Error trying to retrieve the account: ${error}`)
    }
}
