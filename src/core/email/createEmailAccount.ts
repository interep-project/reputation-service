import EmailUser from "../../models/emailUser/EmailUser.model"
// import EmailUserSchema from "../../models/emailUser/EmailUser.schema"
// import { findByHashId } from "../../models/emailUser/EmailUser.statics"
// import {EmailUserData, EmailUserDocument, EmailUserModel} from "../../models/emailUser/EmailUser.types"
import sendEmail from "./sendEmail"

import { dbConnect } from "src/utils/backend/database"

export default async function createEmailAccount(
    hashId: string,
    provider: String,
): Promise<string | void> {
    await dbConnect()
    var verified = false;
    console.log("making account")
    try {
        let account = await EmailUser.findByHashId( hashId ) // not sure if this is right info
        var randEmailToken = Math.floor((Math.random() * 10000));

        if (!account) {
            // account doesn't exist, make one and then send email
            console.log("no account present")
            account = new EmailUser({
                provider,
                hashId,
                verified: false,
                joined: false,
                emailRandomToken: randEmailToken
            })

        } else {
            console.log("account exists")
            //account does exist see if it's verified if not update emailRandomToken and send email
            verified = account.verified
            if(!verified){
                account.emailRandomToken = String(randEmailToken)
            }
            console.log(verified)
        }

        try {
            await account.save()
            // save new account info and then send email if account not verified
            if(!verified){
                console.log("account not verified yet")
                try {
                    console.log("trying to send email")
                    await sendEmail(hashId, String(randEmailToken)).then((message) => {
                        console.log("sendEmail message", message)
                        message = "good"
                        console.log("sendEmail message", message)
                        return message
                    })
                } catch (error) {
                    console.log("error sending email", error)
                    throw new Error(`Error trying to save the account: ${error}`)
                }
            }
        } catch (error) {
            throw new Error(`Error trying to save the account: ${error}`)
        }
    } catch (error) {
        console.log("error!!!!!!")
        console.log(error)
        throw new Error(`Error trying to retrieve the account: ${error}`)
    }
}
