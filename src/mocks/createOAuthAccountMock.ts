import { OAuthAccountData, OAuthAccountDocument } from "@interrep/db"
import { OAuthProvider, ReputationLevel } from "@interrep/reputation"

export default function createOAuthAccountMock(override?: Partial<OAuthAccountDocument>): OAuthAccountData {
    return {
        provider: OAuthProvider.TWITTER,
        providerAccountId: "1",
        uniqueKey: `${OAuthProvider.TWITTER}:1`,
        reputation: ReputationLevel.GOLD,
        isLinkedToAddress: false,
        hasJoinedAGroup: false,
        createdAt: Date.now(),
        ...override
    }
}
