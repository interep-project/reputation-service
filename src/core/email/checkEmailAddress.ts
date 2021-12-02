import EmailDomain from "./emailDomain"

export default function checkEmailAddress(email: string) {
    const groupId = []

    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
    {
        const emailDomain = email.split("@")[1]
        const domain = emailDomain.split(".")[0]
        const topLevelDomain = emailDomain.split(".")[1]

        for (const [key, value] of Object.entries(EmailDomain)) {
            if (domain.includes(value) || topLevelDomain.includes(value)) {
                groupId.push(key)
            }
        }
    }   

    return groupId
}
