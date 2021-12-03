import config from "src/config"
import EmailDomain from "./emailDomain"

export default function createMagicLink(email: string, verificationToken: String, emailDomains: EmailDomain[]): string {
    return `${config.NEXTAUTH_URL}/groups/email/${verificationToken}/${email}/${emailDomains.join("+")}`
}
