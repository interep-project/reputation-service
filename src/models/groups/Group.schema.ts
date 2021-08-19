import { Schema } from "mongoose";
import { TransactionSchema } from "../transactions/Transaction.schema";
import { Web2Providers } from "../web2Accounts/Web2Account.types";
import { findByGroupId } from "./Group.statics";
import {
  IGroup,
  IGroupDocument,
  IGroupModel,
} from "./Group.types";

const GroupSchemaFields: Record<keyof IGroup, any> = {
  groupId: { type: String, required: true },
  description: { type: String, required: true },
};

const GroupSchema = new Schema<IGroupDocument, IGroupModel>(GroupSchemaFields);

GroupSchema.statics.findByGroupId = findByGroupId;

export default GroupSchema;
