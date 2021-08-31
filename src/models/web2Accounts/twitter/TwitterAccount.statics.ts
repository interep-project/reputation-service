import TwitterAccount from "./TwitterAccount.model";
import { ITwitterAccountDocument } from "./TwitterAccount.types";

export async function findByTwitterUsername(
  this: typeof TwitterAccount,
  username: string
): Promise<ITwitterAccountDocument | null> {
  return TwitterAccount.findOne({
    "user.username": username.toLowerCase(),
  });
}
