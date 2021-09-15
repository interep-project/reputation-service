import { Session as NextAuthSession } from "next-auth"

declare module "next-auth" {
    interface Session extends NextAuthSession {
        web2AccountId: string
        twitter: {
            userId: string
            username: string
        }
    }
}
