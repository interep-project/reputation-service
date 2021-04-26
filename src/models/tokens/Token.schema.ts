import { Schema } from "mongoose";
import { findByUserAddress } from "./Token.statics";
import { IToken, ITokenDocument, ITokenModel } from "./Token.types";

const TokenSchemaFields: Record<keyof IToken, any> = {
  userAddress: { type: String, index: true },
  issuanceTimestamp: { type: Date, required: true },
  web2Account: Schema.Types.ObjectId,
};

const UserSchema = new Schema<ITokenDocument, ITokenModel>(TokenSchemaFields);

UserSchema.statics.findByUserAddress = findByUserAddress;

export default UserSchema;
