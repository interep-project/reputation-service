import EmailDomain from "./emailDomain"

export default function getEmailDomains(): string[] {
    return Object.keys(EmailDomain)
}
