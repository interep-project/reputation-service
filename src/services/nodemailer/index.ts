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

export async function sendMail(email: string, subject: string, html: string): Promise<any> {
    return smtpTransport.sendMail({
        to: email,
        subject,
        html
    })
}
