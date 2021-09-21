import { Web2Provider } from "@interrep/reputation-criteria"
import NextAuth, { Account, Session } from "next-auth"
import { JWT } from "next-auth/jwt"
import Providers from "next-auth/providers"
import config from "src/config"
import { checkWeb2Provider, createWeb2Account } from "src/core/accounts"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
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
        async signIn(_user, account: Account) {
            if (!account?.provider || !checkWeb2Provider(account.provider as any)) {
                return false
            }

            try {
                await createWeb2Account(account, account.provider as any)

                return true
            } catch (err) {
                logger.error(err)

                return false
            }
        },
        async jwt(token: JWT, _user, account: Account) {
            if (!account?.provider || !checkWeb2Provider(account.provider as any)) {
                return token
            }

            try {
                const web2Account = await Web2Account.findByProviderAccountId(account.provider as any, account.id)

                if (web2Account) {
                    token.web2AccountId = web2Account.id
                    token.web2Provider = account.provider as Web2Provider
                    token.user = {
                        id: account.id
                    }
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

            if (token.web2Provider) {
                session.web2AccountId = token.web2AccountId
                session.web2Provider = token.web2Provider
                session.user.id = token.user.id
            }

            return session
        }
    }
})
