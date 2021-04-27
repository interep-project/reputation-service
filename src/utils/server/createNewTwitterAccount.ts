import TwitterAccount from "src/models/web2Accounts/twitter/TwitterAccount.model";
import {
  ITwitterAccount,
  ITwitterAccountDocument,
} from "src/models/web2Accounts/twitter/TwitterAccount.types";
import { Web2Providers } from "src/models/web2Accounts/Web2Account.types";

export const createNewTwitterAccount = (
  doc: Omit<ITwitterAccount, "provider" | "createdAt" | "uniqueKey">
): ITwitterAccountDocument =>
  new TwitterAccount({
    ...doc,
    provider: Web2Providers.TWITTER,
    uniqueKey: `${Web2Providers.TWITTER}:${doc.providerAccountId}`,
    createdAt: Date.now(),
  });
