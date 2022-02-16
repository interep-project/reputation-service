import {
    calculateReputation,
    GithubParameters,
    RedditParameters,
    TwitterParameters,
    OAuthProvider
} from "@interep/reputation"
import { Account } from "next-auth"
import { OAuthAccount } from "@interep/db"
import { User } from "src/types/next-auth"
import { connectDatabase } from "src/utils/backend/database"

export default async function createOAuthAccount(user: User, nextAuthAccount: Account): Promise<void> {
    await connectDatabase()

    const provider = nextAuthAccount.provider as OAuthProvider
    const providerAccountId = nextAuthAccount.id

    let account = await OAuthAccount.findByProviderAccountId(provider, providerAccountId)

    if (!account) {
        account = new OAuthAccount({
            provider,
            providerAccountId,
            accessToken: nextAuthAccount.accessToken,
            refreshToken: nextAuthAccount.refreshToken
        })

        switch (provider) {
            case OAuthProvider.GITHUB: {
                const { proPlan, followers, receivedStars } = user as GithubParameters

                account.reputation = calculateReputation(provider, {
                    proPlan,
                    followers,
                    receivedStars
                })

                break
            }
            case OAuthProvider.REDDIT: {
                const { premiumSubscription, karma, coins, linkedIdentities } = user as RedditParameters

                account.reputation = calculateReputation(provider, {
                    premiumSubscription,
                    karma,
                    coins,
                    linkedIdentities
                })

                break
            }
            default: {
                const { verifiedProfile, followers, botometerOverallScore } = user as TwitterParameters

                account.reputation = calculateReputation(provider, {
                    verifiedProfile,
                    followers,
                    botometerOverallScore
                })

                break
            }
        }
    } else {
        account.accessToken = nextAuthAccount.accessToken
        account.refreshToken = nextAuthAccount.refreshToken
    }

    await account.save()
}
