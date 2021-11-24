import { createTransport } from "nodemailer"
import config from "src/config"

const smtpTransport = createTransport({
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

export default async function sendEmail(email: string, verificationToken: String, groupId: String): Promise<void> {
    const link = `${config.HOST}/groups/email/${verificationToken}/${email}/${groupId}`

    await smtpTransport.sendMail({
        to: email,
        subject: "Interrep email confirmation",
        html: `Hello,<br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>.
        <br> You will be redirected to the Semaphore gropu page.`
    })
}
