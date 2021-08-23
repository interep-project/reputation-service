import { ObjectId } from "mongoose";
import { MerkleTreeLeaf, MerkleTreeNode } from "./MerkleTree.model";
import { IMerkleTreeLeafDocument, IMerkleTreeNodeDocument, IMerkleTreeNodeKey } from "./MerkleTree.types";

export async function findByLevelAndIndex(
  this: typeof MerkleTreeNode,
  key: IMerkleTreeNodeKey
): Promise<IMerkleTreeNodeDocument | null> {
  return this.findOne({ key });
}

export async function findLeafByNodeId(
  this: typeof MerkleTreeLeaf,
  nodeId: ObjectId
): Promise<IMerkleTreeLeafDocument | null> {
  return this.findOne({ nodeId });
}
