import { Session as NextAuthSession, Account as NextAuthAccount } from "next-auth"
import { JWT as NextAuthJWT } from "next-auth/jwt"
import { ReputationLevel, Web2Provider, Web2ProviderParameters } from "@interrep/reputation-criteria"

interface User extends Record<string, any> {
    id: string
    username: string
    name: string
    reputation?: ReputationLevel
}

declare module "next-auth" {
    interface Session extends NextAuthSession {
        web2AccountId: string
        web2Provider: Web2Provider
        user: User
    }
}

declare module "next-auth/jwt" {
    interface JWT extends NextAuthJWT {
        web2AccountId: string
        web2Provider: Web2Provider
        user: User
    }
}
