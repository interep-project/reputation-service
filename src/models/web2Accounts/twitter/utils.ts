import TwitterAccount from "./TwitterAccount.model";
import { ITwitterAccountDocument } from "./TwitterAccount.types";

export async function findByTwitterUsername(
  username: string
): Promise<ITwitterAccountDocument | null> {
  const lowercaseUsername = username.toLowerCase();
  return TwitterAccount.findOne({
    "user.username": lowercaseUsername,
  });
}
