import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"
import EmailUser from "../../models/emailUser/EmailUser.model"

export default async function verifyEmailAccount(hashId: string, randToken: string): Promise<string | void> {
    await dbConnect()

    logger.silly(`making account for ${hashId}`)

    let verifiedStatus = false
    let message

    try {
        const account = await EmailUser.findByHashId(hashId)

        if (!account) {
            // Account doesn't exist, make one and then send email.
            console.log("no account present")
            message = "No account present"

            return "No account present"
        }

        console.log("account exists")
        // Account does exist see if it's verified if not update emailRandomToken and send email.
        verifiedStatus = account.verified

        // Already verified.
        if (verifiedStatus) {
            message = `Email ${hashId} is already verified`
        } else if (account.emailRandomToken === randToken) {
            // not verified and random token matches
            account.verified = true
            message = `Email ${hashId} has been Successfully verified`
        } else {
            message = `Email ${hashId} not in system`
        }

        try {
            await account.save()

            return message
            // Save new account info and then send email if account not verified
        } catch (error) {
            throw new Error(`Error trying to save the account: ${error}`)
        }
    } catch (error) {
        console.log("error!!!!!!")
        console.log(error)

        throw new Error(`Error trying to retrieve the account: ${error}`)
    }
}
