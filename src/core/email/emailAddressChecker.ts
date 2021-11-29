import { valid_email_domain_list} from "src/core/email/emailDomains"

export default function checkEmailAddress(email: string) {
    let groupId = [];

    for (const [key, value] of Object.entries(valid_email_domain_list)) {
        if (email.includes(key)){
            groupId.push(value)
            console.log(value)
        }
      }

    return groupId
}
