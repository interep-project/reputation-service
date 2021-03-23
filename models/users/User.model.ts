import { model, Schema, Document } from "mongoose";

export interface IUser {
  twitter: { name: string };
}

interface IUserDoc extends IUser, Document {}

const UserSchemaFields: Record<keyof IUser, any> = {
  twitter: {
    name: { type: String, required: true, index: true },
  },
};

const UserSchema = new Schema(UserSchemaFields);

export const User = model<IUserDoc>("User", UserSchema);
