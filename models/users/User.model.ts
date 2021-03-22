import { model, Schema, Document } from "mongoose";

export interface IUser extends Document {
  twitter: { name: string };
}

const UserSchema = new Schema({
  twitter: {
    name: { type: String, required: true, index: true },
  },
});

export const User = model<IUser>("User", UserSchema);
