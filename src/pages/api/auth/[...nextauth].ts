import { OAuthProvider } from "@interrep/reputation-criteria"
import NextAuth, { Account, Session } from "next-auth"
import { JWT } from "next-auth/jwt"
import Providers from "next-auth/providers"
import config from "src/config"
import { createWeb2Account, mapGithubProfile, mapRedditProfile, mapTwitterProfile } from "src/core/auth"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
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
                await createWeb2Account(user, account, account.provider as OAuthProvider)

                return true
            } catch (err) {
                logger.error(err)

                return false
            }
        },
        async jwt(token: JWT, user: User, account: Account) {
            if (!account?.provider || !(account.provider.toUpperCase() in OAuthProvider)) {
                return token
            }

            try {
                const web2Account = await Web2Account.findByProviderAccountId(
                    account.provider as OAuthProvider,
                    account.id
                )

                if (web2Account) {
                    token.web2AccountId = web2Account.id
                    token.provider = account.provider as OAuthProvider
                    user.reputation = web2Account.basicReputation
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
                session.web2AccountId = token.web2AccountId
                session.provider = token.provider
                session.user = token.user
            }

            return session
        }
    }
})
