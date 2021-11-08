import EmailUser from "../../models/emailUser/EmailUser.model"
import sendEmail from "./sendEmail"

import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger";

export default async function createEmailAccount(
    hashId: string,
    provider: String,
): Promise<string | void> {
    await dbConnect()
    var verified = false;
    logger.silly(`making account ${hashId}`)
    try {
        let account = await EmailUser.findByHashId( hashId ) // not sure if this is right info
        logger.silly(`account ${JSON.stringify(account)}`)
        var randEmailToken = Math.floor((Math.random() * 10000));

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
            //account does exist see if it's verified if not update emailRandomToken and send email
            verified = account.verified
            if(!verified){
                account.emailRandomToken = String(randEmailToken)
            }
            logger.silly(`verified ${verified}`)
        }

        try {
            await account.save()
            // save new account info and then send email if account not verified
            if(!verified){
                logger.silly("account not verified yet")
                try {
                    logger.silly("trying to send email")
                    var message = await sendEmail(hashId, String(randEmailToken)).then((result) => {
                        logger.silly("sendEmail message internal", result)
                        return result
                    })

                    return message

                } catch (error) {
                    throw new Error(`Error trying to save the account: ${error}`)
                }
            } else {
                //account is already verified
                message = "address already verified"
                return message
            }
        } catch (error) {
            throw new Error(`Error trying to save the account: ${error}`)
        }
    } catch (error) {
        throw new Error(`Error trying to retrieve the account: ${error}`)
    }
}
