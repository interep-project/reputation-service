import { Session as NextAuthSession, Account as NextAuthAccount, User as NextAuthUser } from "next-auth"
import { JWT as NextAuthJWT } from "next-auth/jwt"
import { Web2Provider } from "@interrep/reputation-criteria"

interface UserData {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
}

declare module "next-auth" {
    interface Session extends NextAuthSession {
        web2AccountId: string
        web2Provider: Web2Provider
        user: UserData
    }
}

declare module "next-auth/jwt" {
    interface JWT extends NextAuthJWT {
        web2AccountId: string
        web2Provider: Web2Provider
        user: UserData
    }
}
