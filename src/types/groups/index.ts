import { ReputationLevel, Web2Provider } from "@interrep/reputation-criteria"

export enum Web3Provider {
    POAP = "poap"
}

export type Provider = Web2Provider | Web3Provider

export type Group = {
    reputation?: ReputationLevel
    name?: string
    provider: Provider
    size: number
}

export type Groups = Group[]
