import { model, Schema, Document, models } from "mongoose";

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

const MODEL_NAME = "User";

// Because of Next.js HMR we need to get the model if it was already compiled
export default models[MODEL_NAME] ||
  model<IUserDoc>(MODEL_NAME, UserSchema, "users");
