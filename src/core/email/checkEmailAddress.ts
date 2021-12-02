import EmailDomain from "./emailDomain"

export default function checkEmailAddress(email: string) {
    const groupId = []

    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
    {
        for (const [key, value] of Object.entries(EmailDomain)) {
            if (email.includes(value)) {
                groupId.push(key)
            }
        }
    }   

    return groupId
}
