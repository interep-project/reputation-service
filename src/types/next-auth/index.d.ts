import { Session as NextAuthSession, Account as NextAuthAccount, User as NextAuthUser } from "next-auth"
import { JWT as NextAuthJWT } from "next-auth/jwt"
import { Web2Providers } from "src/models/web2Accounts/Web2Account.types"

interface UserData {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
}

declare module "next-auth" {
    interface Session extends NextAuthSession {
        web2AccountId: string
        provider: string
        user: UserData
    }
}

declare module "next-auth/jwt" {
    interface JWT extends NextAuthJWT {
        web2AccountId: string
        provider: string
        user: UserData
    }
}
