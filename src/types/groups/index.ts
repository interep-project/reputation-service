import { Web2Provider } from "@interrep/reputation-criteria"

export type Group = {
    id: string
    provider: Web2Provider
    size: number
}

export type Groups = Group[]
