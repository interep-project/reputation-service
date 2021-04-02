import { Schema } from "mongoose";
import { findByTwitterUsername } from "./User.statics";
import { IUser, IUserDocument, IUserModel } from "./User.types";

const botometerScores = {
  astroturf: Number,
  fake_follower: Number,
  financial: Number,
  other: Number,
  overall: Number,
  self_declared: Number,
  spammer: Number,
};

const UserSchemaFields: Record<keyof IUser, any> = {
  twitter: {
    username: { type: String, required: true, index: true, unique: true },
    id: Number,
    followers_count: Number,
    friends_count: Number,
    created_at: String,
  },
  botometer: {
    cap: { english: Number, universal: Number },
    raw_scores: {
      english: botometerScores,
      universal: botometerScores,
    },
    display_scores: {
      english: botometerScores,
      universal: botometerScores,
    },
  },
};

const UserSchema = new Schema<IUserDocument, IUserModel>(UserSchemaFields);

UserSchema.statics.findByTwitterUsername = findByTwitterUsername;

export default UserSchema;
