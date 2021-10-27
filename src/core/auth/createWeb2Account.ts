import {
    calculateReputation,
    GithubParameters,
    RedditParameters,
    TwitterParameters,
    OAuthProvider
} from "@interrep/reputation-criteria"
import { Account } from "next-auth"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import { User } from "src/types/next-auth"
import { dbConnect } from "src/utils/backend/database"

export default async function createWeb2Account(user: User, account: Account, provider: OAuthProvider): Promise<void> {
    await dbConnect()

    if (!account.id) {
        throw new Error("Invalid account response")
    }

    try {
        let web2Account = await Web2Account.findByProviderAccountId(provider, account.id)

        if (!web2Account) {
            web2Account = new Web2Account({
                provider,
                providerAccountId: account.id,
                isLinkedToAddress: false,
                accessToken: account.accessToken,
                refreshToken: account.refreshToken,
                uniqueKey: `${provider}:${account.id}`,
                createdAt: Date.now()
            })

            switch (provider) {
                case OAuthProvider.TWITTER: {
                    const { verifiedProfile, followers, botometerOverallScore } = user as TwitterParameters

                    web2Account.basicReputation = calculateReputation(provider, {
                        verifiedProfile,
                        followers,
                        botometerOverallScore
                    })

                    break
                }
                case OAuthProvider.GITHUB: {
                    const { proPlan, followers, receivedStars } = user as GithubParameters

                    web2Account.basicReputation = calculateReputation(provider, {
                        proPlan,
                        followers,
                        receivedStars
                    })

                    break
                }
                case OAuthProvider.REDDIT: {
                    const { premiumSubscription, karma, coins, linkedIdentities } = user as RedditParameters

                    web2Account.basicReputation = calculateReputation(provider, {
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
            web2Account.accessToken = account.accessToken
            web2Account.refreshToken = account.refreshToken
        }

        try {
            await web2Account.save()
        } catch (error) {
            throw new Error(`Error trying to save the account: ${error}`)
        }
    } catch (error) {
        throw new Error(`Error trying to retrieve the account: ${error}`)
    }
}
