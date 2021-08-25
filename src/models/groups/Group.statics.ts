import Group from "./Group.model";
import { IGroupDocument } from "./Group.types";

export async function findByGroupId(
  this: typeof Group,
  groupId: string
): Promise<IGroupDocument | null> {
  return this.findOne({ groupId });
}

export async function findGroups(
  this: typeof Group
): Promise<IGroupDocument[] | null> {
  return this.find();
}
