import Web2Account from "../Web2Account.model";
import TwitterAccountSchema from "./TwitterAccount.schema";
import { ITwitterAccountModel } from "./TwitterAccount.types";

const DISCRIMINATOR_NAME = "twitter";

// Because of Next.js HMR we need to get the model if it was already compiled
const TwitterAccount: ITwitterAccountModel =
  Web2Account.discriminators?.[DISCRIMINATOR_NAME] ||
  Web2Account.discriminator(
    DISCRIMINATOR_NAME,
    // @ts-ignore: tricky
    TwitterAccountSchema
  );

export default TwitterAccount;
