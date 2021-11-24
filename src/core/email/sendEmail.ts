import * as nodemailer from "nodemailer"
import config from "src/config"

const smtpTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
        type: "OAuth2",
        user: config.GMAIL_ADDRESS,
        clientId: config.GMAIL_CLIENT_ID,
        clientSecret: config.GMAIL_CLIENT_SECRET,
        refreshToken: config.GMAIL_REFRESH_TOKEN,
        accessToken: config.GMAIL_ACCESS_TOKEN
    }
})

export default async function sendEmail(
    emailAddress: string,
    randToken: String,
    groupId: String
): Promise<boolean | void> {
    // const link = `${config.HOST}/api/email/verifyEmail?id=${randToken}?email=${emailAddress}`
    const link = `${config.HOST}/groups/email/${randToken}/${emailAddress}/${groupId}`

    const mailOptions = {
        to: emailAddress,
        subject: "Interrep email confirmation",
        html: `Hello,<br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>.
        <br> You will be redirected to the Semaphore gropu page.`
    }

    console.log(`in send email file ${typeof smtpTransport}`)

    try {
        const response = await smtpTransport.sendMail(mailOptions)
        console.log("successfully sent email", response)

        return true
    } catch (error) {
        console.log("error sending email", error)

        return false
    }
}
