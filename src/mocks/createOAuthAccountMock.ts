import { OAuthAccountData, OAuthAccountDocument } from "@interep/db"
import { OAuthProvider, ReputationLevel } from "@interep/reputation"

export default function createOAuthAccountMock(override?: Partial<OAuthAccountDocument>): OAuthAccountData {
    return {
        provider: OAuthProvider.TWITTER,
        providerAccountId: "1",
        reputation: ReputationLevel.GOLD,
        hasJoinedAGroup: false,
        createdAt: Date.now(),
        ...override
    }
}
