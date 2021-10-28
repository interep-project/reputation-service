import { OAuthProvider } from "@interrep/reputation-criteria"
import { Session } from "next-auth"

const mockSession: Session = {
    provider: OAuthProvider.TWITTER,
    expires: "123",
    accountId: "6087dabb0b3af8703a581bef",
    user: { id: "12", name: "Joe" }
}

export default mockSession
