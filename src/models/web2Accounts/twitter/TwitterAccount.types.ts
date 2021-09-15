import { Model, Document } from "mongoose"
import { botometerScoreData } from "src/types/botometer"
import { findByTwitterUsername } from "./TwitterAccount.statics"
import { IWeb2Account } from "../Web2Account.types"

export interface IBaseTwitterAccount {
    user: {
        username: string
        name?: string
        id: string
        public_metrics?: {
            followers_count: number
            following_count: number
            tweet_count: number
            listed_count: number
        }
        verified?: boolean
        profile_image_url?: string
        created_at?: string
    }
    botometer?: botometerScoreData
}

export interface ITwitterAccount extends IBaseTwitterAccount, IWeb2Account {}

export interface ITwitterAccountDocument extends ITwitterAccount, Document {}

export interface ITwitterAccountModel extends Model<ITwitterAccountDocument> {
    findByTwitterUsername: typeof findByTwitterUsername
}

export type TwitterReputation = {
    botometer: ITwitterAccountDocument["botometer"]
    user: ITwitterAccountDocument["user"]
}
