import { Session as NextAuthSession, Account as NextAuthAccount, User as NextAuthUser } from "next-auth"
import { JWT as NextAuthJWT } from "next-auth/jwt"

interface UserData {
    id: string
    username: string
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

    interface TwitterAccount extends NextAuthAccount {
        results: {
            user_id: string
            screen_name: string
        }
    }
}

declare module "next-auth/jwt" {
    export interface JWT extends NextAuthJWT {
        web2AccountId: string
        provider: string
        user: UserData
    }
}
