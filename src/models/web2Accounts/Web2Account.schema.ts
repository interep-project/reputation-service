import { Schema } from "mongoose";
import { findByProviderAccountId } from "./Web2Account.statics";
import {
  IWeb2Account,
  IWeb2AccountDocument,
  IWeb2AccountModel,
  Web2Providers,
} from "./Web2Account.types";

const Web2AccountSchemaFields: Record<keyof IWeb2Account, any> = {
  provider: {
    type: String,
    enum: Object.values(Web2Providers),
    required: true,
  },
  providerAccountId: { type: String, index: true, required: true },
  uniqueKey: { type: String, index: true, unique: true },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now },
  refreshToken: String,
  accessToken: String,
  isSeedUser: { type: Boolean, default: false },
};

const options = { discriminatorKey: "provider" };

const Web2AccountSchema = new Schema<IWeb2AccountDocument, IWeb2AccountModel>(
  Web2AccountSchemaFields,
  options
);

Web2AccountSchema.statics.findByProviderAccountId = findByProviderAccountId;

export default Web2AccountSchema;