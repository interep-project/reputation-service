import { Schema } from "mongoose";
import { findByTwitterName } from "./User.statics";
import { IUser, IUserDocument, IUserModel } from "./User.types";

const UserSchemaFields: Record<keyof IUser, any> = {
  twitter: {
    name: { type: String, required: true, index: true },
  },
};

const UserSchema = new Schema<IUserDocument, IUserModel>(UserSchemaFields);

UserSchema.statics.findByTwitterName = findByTwitterName;

export default UserSchema;
