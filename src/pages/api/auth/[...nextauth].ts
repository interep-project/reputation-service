import NextAuth, { Session, TwitterAccount } from "next-auth"
import { JWT } from "next-auth/jwt"
import Providers from "next-auth/providers"
import config from "src/config"
import handleTwitterSignIn from "src/core/auth/twitter/handleSignIn"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import { Web2Providers } from "src/models/web2Accounts/Web2Account.types"
import logger from "src/utils/server/logger"

export default NextAuth({
    providers: [
        Providers.Twitter({
            clientId: config.TWITTER_CONSUMER_KEY || "",
            clientSecret: config.TWITTER_CONSUMER_SECRET || ""
        }),
        Providers.GitHub({
            clientId: config.GITHUB_CLIENT_ID || "",
            clientSecret: config.GITHUB_CLIENT_SECRET || ""
        })
    ],
    secret: config.NEXTAUTH_SECRET,
    jwt: {
        // signingKey: config.JWT_SIGNING_PRIVATE_KEY,
        secret: config.JWT_SECRET
    },
    callbacks: {
        async signIn(_user, account: TwitterAccount) {
            switch (account?.provider) {
                case "twitter":
                    try {
                        await handleTwitterSignIn(account)
                    } catch (err) {
                        logger.error(err)

                        return false
                    }

                    return true
                default:
                    return false
            }
        },
        async jwt(token: JWT, _user, account: TwitterAccount) {
            switch (account?.provider) {
                case "twitter":
                    if (account.results.user_id) {
                        const userId = account.results.user_id
                        const web2Account = await Web2Account.findByProviderAccountId(Web2Providers.TWITTER, userId)

                        token.web2AccountId = web2Account?.id
                        token.provider = account.provider
                        token.user = {
                            username: account.results.screen_name.toLowerCase(),
                            id: userId
                        }
                    }

                    return token
                default:
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
                session.user.id = token.user.id
                session.user.username = token.user.username
            }

            return session
        }
    }
})
