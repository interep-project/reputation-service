import User from "./User.model";
import { IUserDocument } from "./User.types";

export async function findByTwitterUsername(
  this: typeof User,
  username: string
): Promise<IUserDocument | null> {
  return this.findOne({ "twitter.user.username": username } as any);
}
