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

export default async function sendEmail(email: string, verificationToken: String, groupId: String[]): Promise<void> {
    let group_string = groupId[0]

    for (let i = 1; i < groupId.length; i++) {
        group_string = `${group_string}+${groupId[i]}`
    }

    const link = `${config.HOST}/groups/email/${verificationToken}/${email}/${group_string}`

    await smtpTransport.sendMail({
        to: email,
        subject: "Interrep email confirmation",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
        .button {
        border: 2px solid black;
        border-radius: 5%;
        background-color: white;
        padding: 5px 10px;
        text-align: center;
        // display: inline-block;
        cursor: pointer;
        }

        </style>
        </head>

        <body>

        Hello,<br> Please Click below to be join/leave the <b>${groupId}</b> Semaphore group.
        <br>
        <a href=${link}><button class="button button1">Join Group</button></a>
        </body>
        </html>
    `
    })
}
