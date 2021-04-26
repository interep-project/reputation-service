import { Model, Document } from "mongoose";

export enum Web2Providers {
  TWITTER = "twitter",
}

export interface IWeb2Account {
  provider: Web2Providers;
  providerAccountId: string;
  uniqueKey: string;
  refreshToken?: string;
  accessToken?: string;
  createdAt: string;
  updatedAt?: string;
  isSeedUser?: boolean;
}

export interface IWeb2AccountDocument extends IWeb2Account, Document {}

export type IWeb2AccountModel = Model<IWeb2AccountDocument>;
