import { ReputationLevel, OAuthProvider } from "@interrep/reputation"
import { PoapEvent } from "src/core/poap"

export enum Web3Provider {
    POAP = "poap"
}

export type Provider = OAuthProvider | Web3Provider | "telegram" | "email"

export type Group = {
    provider: Provider
    name: ReputationLevel | PoapEvent | string
    rootHash: string
    size: number
}

export type Groups = Group[]
