import { model, models } from "mongoose";
import TokenSchema from "./Token.schema";
import { ITokenDocument, ITokenModel } from "./Token.types";

const MODEL_NAME = "Token";

// Because of Next.js HMR we need to get the model if it was already compiled
const Token: ITokenModel =
  (models[MODEL_NAME] as ITokenModel) ||
  model<ITokenDocument, ITokenModel>(MODEL_NAME, TokenSchema, "tokens");

export default Token;
