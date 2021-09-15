import NextAuth, { Session } from "next-auth"
import Providers from "next-auth/providers"
import { WithAdditionalParams } from "next-auth/_utils"
import config from "src/config"
import handleTwitterSignIn from "src/core/auth/twitter/handleSignIn"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import { Web2Providers } from "src/models/web2Accounts/Web2Account.types"
import { JWToken } from "src/types/nextAuth/token"
import { NextAuthTwitterAccount } from "src/types/nextAuth/twitter"
import logger from "src/utils/server/logger"

export default NextAuth({
    providers: [
        Providers.Twitter({
            clientId: config.TWITTER_CONSUMER_KEY || "",
            clientSecret: config.TWITTER_CONSUMER_SECRET || ""
        })
    ],

    secret: config.NEXTAUTH_SECRET,

    jwt: {
        // signingKey: config.JWT_SIGNING_PRIVATE_KEY,
        secret: config.JWT_SECRET
    },

    // See docs: https://next-auth.js.org/configuration/callbacks
    callbacks: {
        async signIn(_user, account) {
            // console.log(`user`, user);
            // console.log(`account`, account);
            // console.log(`profile`, profile);
            if (account?.provider === "twitter") {
                try {
                    await handleTwitterSignIn((account as unknown) as NextAuthTwitterAccount)
                } catch (err) {
                    logger.error(err)
                    return false
                }
                return true
            }

            return false
        },
        async jwt(token, _user, account) {
            if (account?.provider === "twitter" && ((account as unknown) as NextAuthTwitterAccount)?.results.user_id) {
                const userId = ((account as unknown) as NextAuthTwitterAccount).results.user_id
                const web2Account = await Web2Account.findByProviderAccountId(Web2Providers.TWITTER, userId)
                if (web2Account) {
                    token.web2AccountId = web2Account.id
                    token.twitter = {
                        username: ((account as unknown) as NextAuthTwitterAccount)?.results?.screen_name.toLowerCase(),
                        userId
                    }
                }
            }

            return token
        },
        // @ts-ignore: todo
        async session(session: Session, token?: JWToken) {
            if (!token) return session
            session.web2AccountId = token.web2AccountId
            if (token.twitter) {
                (session as WithAdditionalParams<Session>).twitter = token.twitter
            }

            return Promise.resolve(session)
        }
    }
})
