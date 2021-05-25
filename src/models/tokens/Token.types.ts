import { Model, Document } from "mongoose";
import { ITransaction } from "../transactions/Transaction.types";
import { Web2Providers } from "../web2Accounts/Web2Account.types";
import { findByUserAddress } from "./Token.statics";

export enum TokenStatus {
  NOT_MINTED = "NOT_MINTED",
  MINT_PENDING = "MINT_PENDING",
  MINTED = "MINTED",
  BURN_PENDING = "BURN_PENDING",
  BURNED = "BURNED",
}

export interface IToken {
  chainId: number;
  contractAddress: number;
  userAddress: string;
  encryptedAttestation: string;
  issuanceTimestamp: number;
  idHash?: string;
  status: TokenStatus;
  mintTransactions?: ITransaction[];
  web2Provider: Web2Providers;
}

export interface ITokenDocument extends IToken, Document {}

export interface ITokenModel extends Model<ITokenDocument> {
  findByUserAddress: typeof findByUserAddress;
}
