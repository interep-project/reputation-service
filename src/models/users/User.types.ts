import { Model, Document } from "mongoose";
import { botometerScoreData } from "src/types/botometer";
import { findByTwitterUsername } from "./User.statics";

export interface IUser {
  twitter: {
    username: string;
    id?: number;
    followers_count?: number;
    friends_count?: number;
    created_at?: string;
  };
  botometer?: botometerScoreData;
}

export interface IUserDocument extends IUser, Document {}

export interface IUserModel extends Model<IUserDocument> {
  findByTwitterUsername: typeof findByTwitterUsername;
}
