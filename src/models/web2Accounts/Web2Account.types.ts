import { ReputationLevel } from "@interrep/reputation-criteria";
import { Model, Document } from "mongoose";
import {
  ITwitterAccountDocument,
  TwitterReputation,
} from "./twitter/TwitterAccount.types";
import { findByProviderAccountId } from "./Web2Account.statics";

export enum Web2Providers {
  TWITTER = "twitter",
}

export interface IWeb2Account {
  provider: Web2Providers;
  providerAccountId: string;
  uniqueKey: string;
  basicReputation?: ReputationLevel;
  isLinkedToAddress: boolean;
  refreshToken?: string;
  accessToken?: string;
  createdAt: number;
  updatedAt?: string;
  isSeedUser?: boolean;
}

export interface IWeb2AccountDocument extends IWeb2Account, Document {}

export interface IWeb2AccountModel extends Model<IWeb2AccountDocument> {
  findByProviderAccountId: typeof findByProviderAccountId;
}

export function isTwitterAccount(
  web2Account: IWeb2AccountDocument
): web2Account is ITwitterAccountDocument {
  return web2Account.provider === Web2Providers.TWITTER;
}

// Response of a query which should NOT reveal information that can be used to identify the account
export type AccountReputationByAddress = {
  provider: Web2Providers;
  basicReputation?: ReputationLevel;
};

// Response of a query, knowing the account already
export type AccountReputationByAccount = {
  provider: Web2Providers;
  basicReputation?: ReputationLevel;
} & TwitterReputation;
