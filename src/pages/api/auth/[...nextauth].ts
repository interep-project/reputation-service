import { OAuthProvider } from "@interrep/reputation-criteria"
import NextAuth, { Account, Session } from "next-auth"
import { JWT } from "next-auth/jwt"
import Providers from "next-auth/providers"
import config from "src/config"
import { createOAuthAccount, mapGithubProfile, mapRedditProfile, mapTwitterProfile } from "src/core/auth"
import { OAuthAccount } from "@interrep/db"
import { User } from "src/types/next-auth"
import logger from "src/utils/backend/logger"

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
            if (!account?.provider || !(account.provider.toUpperCase() in OAuthProvider)) {
                return false
            }

            try {
                await createOAuthAccount(user, account, account.provider as OAuthProvider)

                return true
            } catch (err) {
                logger.error(err)

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
                    user.reputation = account.reputation
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
