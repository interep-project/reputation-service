import EmailDomain from "./emailDomain"
import getEmailDomains from "./getEmailDomains"

export default function getEmailDomainsByEmail(email: string): EmailDomain[] {
    const emailDomains: EmailDomain[] = []

    if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        const [domain, topLevelDomain] = email.split("@")[1].split(".")

        const supportedEmailDomains = getEmailDomains()

        for (const supportedEmailDomain of supportedEmailDomains) {
            if (domain.includes(supportedEmailDomain) || topLevelDomain.includes(supportedEmailDomain)) {
                emailDomains.push(supportedEmailDomain)
            }
        }
    }

    return emailDomains
}
