import Web2Account from "../Web2Account.model";
import TwitterAccountSchema from "./TwitterAccount.schema";
import { ITwitterAccountModel } from "./TwitterAccount.types";

// Because of Next.js HMR we need to get the model if it was already compiled
const TwitterAccount: ITwitterAccountModel = Web2Account.discriminator(
  "twitter",
  TwitterAccountSchema
);

export default TwitterAccount;
