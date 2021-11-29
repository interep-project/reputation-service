import  EmailDomains from "src/core/email/emailDomains"

export default function checkEmailAddress(email: string) {
    let groupId = [];

    for (const [key, value] of Object.entries(EmailDomains)) {
        if (email.includes(value)){
            groupId.push(key)
            console.log(key)
        }
      }

    return groupId
}
