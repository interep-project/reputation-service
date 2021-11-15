import EmailUser from "../../models/emailUser/EmailUser.model"

import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function verifyEmailAccount(
    hashId: string,
    randToken: string,
    // provider: String,
): Promise<string | void> {
    await dbConnect()
    
    logger.silly(`making account for ${hashId}`)
    var verifiedStatus = false
    var message

    try {
        let account = await EmailUser.findByHashId( hashId )

        if (!account) {
            // account doesn't exist, make one and then send email
            console.log("no account present")
            message = "No account present"

        } else {
            console.log("account exists")
            //account does exist see if it's verified if not update emailRandomToken and send email
            verifiedStatus = account.verified
            
            //already verified
            if(verifiedStatus){
                message = "Email "+hashId+" is already verified"
            } else if (account.emailRandomToken == randToken){
                // not verified and random token matches
                account.verified = true
                message = "Email "+hashId+" has been Successfully verified"
            } else {
                message = "Email "+hashId+" not in system"
            }

        try {
            await account.save()
            return message
            // save new account info and then send email if account not verified
        } catch (error) {
            throw new Error(`Error trying to save the account: ${error}`)
        }

    }
    } catch (error) {
        console.log("error!!!!!!")
        console.log(error)
        throw new Error(`Error trying to retrieve the account: ${error}`)
    }
}
