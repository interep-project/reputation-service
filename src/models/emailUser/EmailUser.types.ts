import type { Document, Model } from "mongoose"
import type { findByHashId } from "./EmailUser.statics"

export type EmailUserData = {
    hashId: string
    verified: boolean
    joined: boolean
    emailRandomToken: String
}

export type EmailUserDocument = EmailUserData & Document

export type EmailUserModel = Model<EmailUserDocument> & {
    findByHashId: typeof findByHashId
}

