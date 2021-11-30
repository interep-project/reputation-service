import EmailDomains from "src/core/email/emailDomains"

export default function checkEmailAddress(email: string) {
    const groupId = []

    for (const [key, value] of Object.entries(EmailDomains)) {
        if (email.includes(value)) {
            groupId.push(key)
        }
    }

    return groupId
}
