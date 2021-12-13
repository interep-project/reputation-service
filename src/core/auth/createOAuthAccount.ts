import {
    calculateReputation,
    GithubParameters,
    RedditParameters,
    TwitterParameters,
    OAuthProvider
} from "@interrep/reputation"
import { Account } from "next-auth"
import { OAuthAccount } from "@interrep/db"
import { User } from "src/types/next-auth"
import { dbConnect } from "src/utils/backend/database"

export default async function createOAuthAccount(
    user: User,
    nextAuthAccount: Account,
    provider: OAuthProvider
): Promise<void> {
    await dbConnect()

    if (!nextAuthAccount.id) {
        throw new Error("Invalid account response")
    }

    try {
        let account = await OAuthAccount.findByProviderAccountId(provider, nextAuthAccount.id)

        if (!account) {
            account = new OAuthAccount({
                provider,
                providerAccountId: nextAuthAccount.id,
                isLinkedToAddress: false,
                accessToken: nextAuthAccount.accessToken,
                refreshToken: nextAuthAccount.refreshToken,
                uniqueKey: `${provider}:${nextAuthAccount.id}`,
                createdAt: Date.now()
            })

            switch (provider) {
                case OAuthProvider.TWITTER: {
                    const { verifiedProfile, followers, botometerOverallScore } = user as TwitterParameters

                    account.reputation = calculateReputation(provider, {
                        verifiedProfile,
                        followers,
                        botometerOverallScore
                    })

                    break
                }
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
                default:
            }
        } else {
            account.accessToken = nextAuthAccount.accessToken
            account.refreshToken = nextAuthAccount.refreshToken
        }

        try {
            await account.save()
        } catch (error) {
            throw new Error(`Error trying to save the account: ${error}`)
        }
    } catch (error) {
        throw new Error(`Error trying to retrieve the account: ${error}`)
    }
}
