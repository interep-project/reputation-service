import { ReputationLevel, OAuthProvider } from "@interrep/reputation-criteria"
import { Schema } from "mongoose"
import { findByProviderAccountId } from "./Web2Account.statics"
import { IWeb2Account, IWeb2AccountDocument, IWeb2AccountModel } from "./Web2Account.types"

const Web2AccountSchemaFields: Record<keyof IWeb2Account, any> = {
    provider: {
        type: String,
        enum: Object.values(OAuthProvider),
        required: true
    },
    providerAccountId: { type: String, index: true, required: true },
    uniqueKey: { type: String, index: true, unique: true },
    basicReputation: { type: String, enum: Object.values(ReputationLevel) },
    isLinkedToAddress: { type: Boolean, required: true },
    hasJoinedAGroup: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now },
    refreshToken: String,
    accessToken: String,
    isSeedUser: { type: Boolean, default: false }
}

const options = { discriminatorKey: "provider" }

const Web2AccountSchema = new Schema<IWeb2AccountDocument, IWeb2AccountModel>(Web2AccountSchemaFields, options)

Web2AccountSchema.statics.findByProviderAccountId = findByProviderAccountId

export default Web2AccountSchema
