import { model, models } from "mongoose";
import UserSchema from "./User.schema";
import { IUserDocument, IUserModel } from "./User.types";

const MODEL_NAME = "User";

// Because of Next.js HMR we need to get the model if it was already compiled
const User: IUserModel =
  (models[MODEL_NAME] as IUserModel) ||
  model<IUserDocument, IUserModel>(MODEL_NAME, UserSchema, "users");

export default User;
