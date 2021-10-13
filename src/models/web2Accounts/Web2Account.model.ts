import { model, models } from "mongoose"
import Web2AccountSchema from "./Web2Account.schema"
import { IWeb2AccountDocument, IWeb2AccountModel } from "./Web2Account.types"

const MODEL_NAME = "Web2Account"

// Because of Next.js HMR we need to get the model if it was already compiled
const Web2Account: IWeb2AccountModel =
    (models[MODEL_NAME] as IWeb2AccountModel) ||
    model<IWeb2AccountDocument, IWeb2AccountModel>(MODEL_NAME, Web2AccountSchema, "web2accounts")

export default Web2Account
