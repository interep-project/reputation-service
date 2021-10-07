import { ReputationLevel, Web2Provider } from "@interrep/reputation-criteria"
import { PoapGroupName } from "src/core/groups/poap"

export enum Web3Provider {
    POAP = "poap"
}

export type Provider = Web2Provider | Web3Provider

export type Group = {
    name: ReputationLevel | PoapGroupName
    provider: Provider
    size: number
}

export type Groups = Group[]
