import { Schema } from "mongoose";
import { TransactionSchema } from "../transactions/Transaction.schema";
import { Web2Providers } from "../web2Accounts/Web2Account.types";
import { findByUserAddress } from "./Token.statics";
import {
  IToken,
  ITokenDocument,
  ITokenModel,
  TokenStatus,
} from "./Token.types";

const TokenSchemaFields: Record<keyof IToken, any> = {
  userAddress: { type: String, index: true },
  issuanceTimestamp: { type: Date, required: true },
  web2Account: { type: Schema.Types.ObjectId, index: true, unique: true },
  idHash: { type: String, index: true, required: true },
  status: { type: String, enum: Object.values(TokenStatus), required: true },
  mintTransactions: [TransactionSchema],
  web2Provider: {
    type: String,
    enum: Object.values(Web2Providers),
    required: true,
  },
};

const UserSchema = new Schema<ITokenDocument, ITokenModel>(TokenSchemaFields);

UserSchema.statics.findByUserAddress = findByUserAddress;

export default UserSchema;
