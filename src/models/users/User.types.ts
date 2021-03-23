import { Model, Document } from "mongoose";
import { findByTwitterName } from "./User.statics";

export interface IUser {
  twitter: { name: string };
}

export interface IUserDocument extends IUser, Document {}

export interface IUserModel extends Model<IUserDocument> {
  findByTwitterName: typeof findByTwitterName;
}
