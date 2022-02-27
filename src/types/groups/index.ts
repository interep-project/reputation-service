import { ReputationLevel, OAuthProvider } from "@interep/reputation"
import { TelegramGroup } from "@interep/telegram-bot"
import { EmailDomain } from "src/core/email"
import { PoapEvent } from "src/core/poap"

export type Provider = OAuthProvider | "poap" | "telegram" | "email"
export type GroupName = ReputationLevel | PoapEvent | TelegramGroup | EmailDomain

export type Group = {
    provider: Provider
    name: GroupName
    root: string
    size: number
    numberOfLeaves: number
}

export type Groups = Group[]
