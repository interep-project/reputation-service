import { model, models } from "mongoose";
import GroupSchema from "./Group.schema";
import { IGroupDocument, IGroupModel } from "./Group.types";

const MODEL_NAME = "Group";

// Because of Next.js HMR we need to get the model if it was already compiled
const Group: IGroupModel =
  (models[MODEL_NAME] as IGroupModel) ||
  model<IGroupDocument, IGroupModel>(MODEL_NAME, GroupSchema, "groups");

export default Group;
