import { ReputationLevel, OAuthProvider } from "@interrep/reputation"
import { TelegramGroup } from "@interrep/telegram-bot"
import { EmailDomain } from "src/core/email"
import { PoapEvent } from "src/core/poap"

export type Provider = OAuthProvider | "poap" | "telegram" | "email"
export type GroupName = ReputationLevel | PoapEvent | TelegramGroup | EmailDomain

export type Group = {
    provider: Provider
    name: GroupName
    rootHash: string
    size: number
}

export type Groups = Group[]
