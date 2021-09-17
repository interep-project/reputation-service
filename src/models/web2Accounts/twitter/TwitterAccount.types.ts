import { Document, Model } from "mongoose"
import { BotometerScoreData } from "botometer"
import { IWeb2Account } from "../Web2Account.types"
import { findByTwitterUsername } from "./TwitterAccount.statics"

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
    botometer?: BotometerScoreData
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
