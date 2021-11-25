import { ReputationLevel, OAuthProvider } from "@interrep/reputation-criteria"
import { PoapGroupName } from "src/core/groups/poap"

export enum Web3Provider {
    POAP = "poap"
}

export type Provider = OAuthProvider | Web3Provider | "telegram" | "email"

export type Group = {
    name: ReputationLevel | PoapGroupName | string
    provider: Provider
    size: number
}

export type Groups = Group[]
