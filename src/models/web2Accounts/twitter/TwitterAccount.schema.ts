import { Schema } from "mongoose";
import { findByTwitterUsername } from "./TwitterAccount.statics";
import {
  IBaseTwitterAccount,
  ITwitterAccountDocument,
  ITwitterAccountModel,
} from "./TwitterAccount.types";

const botometerScores = {
  astroturf: Number,
  fake_follower: Number,
  financial: Number,
  other: Number,
  overall: Number,
  self_declared: Number,
  spammer: Number,
};

const TwitterAccountSchemaFields: Record<keyof IBaseTwitterAccount, any> = {
  user: {
    username: {
      type: String,
      required: true,
      index: true,
      unique: true,
      lowercase: true,
    },
    name: String,
    id: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
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

const TwitterAccountSchema = new Schema<
  ITwitterAccountDocument,
  ITwitterAccountModel
>(TwitterAccountSchemaFields);

TwitterAccountSchema.statics.findByTwitterUsername = findByTwitterUsername;

export default TwitterAccountSchema;
