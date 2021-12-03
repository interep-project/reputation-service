import EmailDomain from "./emailDomain"

export default function getEmailDomains(): EmailDomain[] {
    return Object.values(EmailDomain)
}
