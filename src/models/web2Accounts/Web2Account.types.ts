import { ReputationLevel, OAuthProvider } from "@interrep/reputation-criteria"
import { Model, Document } from "mongoose"
import { findByProviderAccountId } from "./Web2Account.statics"

export interface IWeb2Account {
    provider: OAuthProvider
    providerAccountId: string
    uniqueKey: string
    basicReputation?: ReputationLevel
    isLinkedToAddress: boolean
    hasJoinedAGroup?: boolean
    refreshToken?: string
    accessToken?: string
    createdAt: number
    updatedAt?: string
    isSeedUser?: boolean
}

export interface IWeb2AccountDocument extends IWeb2Account, Document {}

export interface IWeb2AccountModel extends Model<IWeb2AccountDocument> {
    findByProviderAccountId: typeof findByProviderAccountId
}
