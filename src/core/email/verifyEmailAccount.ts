import EmailUser from "../../models/emailUser/EmailUser.model"

import { dbConnect } from "src/utils/backend/database"

export default async function verifyEmailAccount(
    hashId: string,
    randToken: string,
    // provider: String,
): Promise<string | void> {
    await dbConnect()
    
    console.log("making account")
    var verifiedStatus = false
    var message

    try {
        let account = await EmailUser.findByHashId( hashId ) // not sure if this is right info

        if (!account) {
            // account doesn't exist, make one and then send email
            console.log("no account present")

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
