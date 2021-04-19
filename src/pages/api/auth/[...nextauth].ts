import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import config from "src/config";
import handleTwitterSignIn from "src/core/auth/twitter/handleSignIn";
import { JWToken } from "src/types/nextAuth/token";
import { NextAuthTwitterAccount } from "src/types/nextAuth/twitter";

export default NextAuth({
  providers: [
    Providers.Twitter({
      clientId: config.TWITTER_CONSUMER_KEY || "",
      clientSecret: config.TWITTER_CONSUMER_SECRET || "",
    }),
  ],

  secret: config.NEXTAUTH_SECRET,

  jwt: {
    // signingKey: config.JWT_SIGNING_PRIVATE_KEY,
    secret: config.JWT_SECRET,
  },

  // See docs: https://next-auth.js.org/configuration/callbacks
  callbacks: {
    async signIn(_user, account) {
      // console.log(`user`, user);
      // console.log(`account`, account);
      // console.log(`profile`, profile);
      if (account?.provider === "twitter") {
        await handleTwitterSignIn(account as NextAuthTwitterAccount);
        return true;
      }

      return false;
    },
    async jwt(token, _user, account) {
      if (account?.provider === "twitter") {
        (token as JWToken).twitter = {
          username: (account as NextAuthTwitterAccount)?.results?.screen_name,
          id: (account as NextAuthTwitterAccount)?.results?.user_id,
        };
      }

      return token;
    },
  },
});
