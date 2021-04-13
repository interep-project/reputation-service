import { Schema } from "mongoose";
import { BasicTwitterReputation } from "src/types/twitter";
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
    isSeedUser: { type: Boolean, index: true },
    reputation: { type: String, enum: BasicTwitterReputation },
    user: {
      username: {
        type: String,
        required: true,
        index: true,
        unique: true,
        lowercase: true,
      },
      name: String,
      id: String,
      public_metrics: {
        followers_count: Number,
        following_count: Number,
        tweet_count: Number,
        listed_count: Number,
      },
      verified: Boolean,
      profile_image_url: String,
      created_at: String,
    },
    refreshToken: String,
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
  },
};

const UserSchema = new Schema<IUserDocument, IUserModel>(UserSchemaFields);

UserSchema.statics.findByTwitterUsername = findByTwitterUsername;

export default UserSchema;
