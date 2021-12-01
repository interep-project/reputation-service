import EmailDomain from "./emailDomain"

export default function checkEmailAddress(email: string) {
    const groupId = []

    for (const [key, value] of Object.entries(EmailDomain)) {
        if (email.includes(value)) {
            groupId.push(key)
        }
    }

    return groupId
}
