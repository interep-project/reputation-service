import { OAuthProvider, ReputationLevel } from "@interep/reputation"
import { Session } from "next-auth"

export default function createSessionMock(override?: any): Session {
    return {
        provider: OAuthProvider.TWITTER,
        accountId: "6087dabb0b3af8703a581bef",
        user: {
            id: "12",
            username: "jack",
            name: "Jack",
            reputation: ReputationLevel.GOLD
        },
        ...override
    }
}
