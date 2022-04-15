import {
    calculateReputation,
    GithubParameters,
    RedditParameters,
    TwitterParameters,
    OAuthProvider,
    ReputationLevel
} from "@interep/reputation"
import { Account } from "next-auth"
import { OAuthAccount } from "@interep/db"
import { User } from "src/types/next-auth"
import { connectDatabase } from "src/utils/backend/database"
import { currentNetwork, SupportedChainId } from "src/config"

export default async function createOAuthAccount(user: User, nextAuthAccount: Account): Promise<boolean> {
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

        /* istanbul ignore next */
        if (currentNetwork.chainId === SupportedChainId.ARBITRUM && account.reputation === ReputationLevel.UNRATED) {
            return false
        }
    } else {
        account.accessToken = nextAuthAccount.accessToken
        account.refreshToken = nextAuthAccount.refreshToken
    }

    await account.save()

    return true
}
