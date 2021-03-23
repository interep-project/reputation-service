import User from "./User.model";
import { IUserDocument } from "./User.types";

export async function findByTwitterName(
  this: typeof User,
  name: string
): Promise<IUserDocument | null> {
  console.log(`name`, name);
  return this.findOne({ twitter: { name } });
}
