import { MerkleTreeNode, MerkleTreeZero } from "./MerkleTree.model";
import {
  IMerkleTreeNodeDocument,
  IMerkleTreeNodeKey,
  IMerkleTreeZeroDocument,
} from "./MerkleTree.types";

export async function findByLevelAndIndex(
  this: typeof MerkleTreeNode,
  key: IMerkleTreeNodeKey
): Promise<IMerkleTreeNodeDocument | null> {
  return this.findOne({ key }).populate("parent");
}

export async function findByGroupIdAndHash(
  this: typeof MerkleTreeNode,
  groupId: string,
  hash: string
): Promise<IMerkleTreeNodeDocument | null> {
  return this.findOne({ "key.groupId": groupId, hash }).populate("parent");
}

export async function getNumberOfNodes(
  this: typeof MerkleTreeNode,
  groupId: string,
  level: number
): Promise<number> {
  return this.countDocuments({ "key.groupId": groupId, "key.level": level });
}

export async function findZeroes(
  this: typeof MerkleTreeZero
): Promise<IMerkleTreeZeroDocument[] | null> {
  return this.find();
}
