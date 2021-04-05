import { Model, Document } from "mongoose";
import { botometerScoreData } from "src/types/botometer";
import { BasicTwitterReputation } from "src/types/twitter";
import { findByTwitterUsername } from "./User.statics";

export interface IUser {
  twitter: {
    user?: {
      username: string;
      name?: string;
      id?: string;
      public_metrics?: {
        followers_count: number;
        following_count: number;
        tweet_count: number;
        listed_count: number;
      };
      verified?: boolean;
      profile_image_url?: string;
      created_at?: string;
    };
    reputation?: BasicTwitterReputation;
    botometer?: botometerScoreData;
  };
}

export interface IUserDocument extends IUser, Document {}

export interface IUserModel extends Model<IUserDocument> {
  findByTwitterUsername: typeof findByTwitterUsername;
}
