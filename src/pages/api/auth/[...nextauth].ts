import { OAuthAccount } from "@interep/db"
import { getOAuthProviders, OAuthProvider, ReputationLevel } from "@interep/reputation"
import NextAuth, { Account, Session } from "next-auth"
import { JWT } from "next-auth/jwt"
import Providers from "next-auth/providers"
import config from "src/config"
import { createOAuthAccount, mapGithubProfile, mapRedditProfile, mapTwitterProfile } from "src/core/oauth"
import { User } from "src/types/next-auth"
import { logger } from "src/utils/backend"

export default NextAuth({
    providers: [
        Providers.Twitter({
            clientId: config.TWITTER_CONSUMER_KEY || "",
            clientSecret: config.TWITTER_CONSUMER_SECRET || "",
            profile: mapTwitterProfile
        }),
        Providers.GitHub({
            clientId: config.GITHUB_CLIENT_ID || "",
            clientSecret: config.GITHUB_CLIENT_SECRET || "",
            profile: mapGithubProfile
        }),
        Providers.Reddit({
            clientId: config.REDDIT_CLIENT_ID || "",
            clientSecret: config.REDDIT_CLIENT_SECRET || "",
            profile: mapRedditProfile
        })
    ],
    pages: {
        signIn: "/"
    },
    secret: config.NEXTAUTH_SECRET,
    jwt: {
        // signingKey: config.JWT_SIGNING_PRIVATE_KEY,
        secret: config.JWT_SECRET
    },
    callbacks: {
        async signIn(user: User, account: Account) {
            const providers = getOAuthProviders()

            if (
                !account ||
                !account.provider ||
                !account.id ||
                !providers.includes(account.provider as OAuthProvider)
            ) {
                return false
            }

            try {
                if (await createOAuthAccount(user, account)) {
                    return true
                }

                return "/error?error=insufficient-reputation"
            } catch (error: any) {
                logger.error(error)

                return false
            }
        },
        async jwt(token: JWT, user: User, nextAuthAccount: Account) {
            if (!nextAuthAccount?.provider || !(nextAuthAccount.provider.toUpperCase() in OAuthProvider)) {
                return token
            }

            try {
                const account = await OAuthAccount.findByProviderAccountId(
                    nextAuthAccount.provider as OAuthProvider,
                    nextAuthAccount.id
                )

                if (account) {
                    token.accountId = account.id
                    token.provider = nextAuthAccount.provider as OAuthProvider
                    user.reputation = account.reputation as ReputationLevel
                    token.user = user
                }

                return token
            } catch (err) {
                logger.error(err)

                return token
            }
        },
        async session(session: Session, token: JWT) {
            if (!token) {
                return session
            }

            if (token.provider) {
                session.accountId = token.accountId
                session.provider = token.provider
                session.user = token.user
            }

            return session
        }
    }
})
