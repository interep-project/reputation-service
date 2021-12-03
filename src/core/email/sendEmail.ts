import { sendMail } from "src/services/nodemailer"
import { createMagicLink, EmailDomain } from "."

export default async function sendEmail(
    email: string,
    verificationToken: string,
    emailDomains: EmailDomain[]
): Promise<void> {
    const link = createMagicLink(email, verificationToken, emailDomains)
    const subject = "Interrep email confirmation"
    const html = `
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

        Hello,<br> Please Click below to be join/leave the <b>${emailDomains}</b> Semaphore group.
        <br>
        <a href=${link}><button class="button button1">Join Group</button></a>
        </body>
        </html>
    `

    await sendMail(email, subject, html)
}
