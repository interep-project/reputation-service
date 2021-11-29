import { ReputationLevel, OAuthProvider } from "@interrep/reputation-criteria"
import { PoapEvent } from "src/core/poap"

export enum Web3Provider {
    POAP = "poap"
}

export type Provider = OAuthProvider | Web3Provider | "telegram" | "email"

export type Group = {
    name: ReputationLevel | PoapEvent | string
    provider: Provider
    size: number
}

export type Groups = Group[]
