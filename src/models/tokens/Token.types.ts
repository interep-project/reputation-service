import { Model, Document } from "mongoose";
import { findByUserAddress } from "./Token.statics";

export interface IToken {
  userAddress: string;
  issuanceTimestamp: number;
  web2Account: string;
  idHash?: string;
}

export interface ITokenDocument extends IToken, Document {}

export interface ITokenModel extends Model<ITokenDocument> {
  findByUserAddress: typeof findByUserAddress;
}
