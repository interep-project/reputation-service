import { Model, Document, ObjectId } from "mongoose";
import { findByLevelAndIndex } from "./MerkleTree.statics";

export interface IMerkleTreeNodeKey {
  groupId: string;
  level: number;
  index: number;
}

export interface IMerkleTreeNode {
  key: IMerkleTreeNodeKey;
  parent?: ObjectId; // Root node has no parent
  hash: string;
}

export interface IMerkleTreeLeaf {
  groupId: string;
  idCommitment: string;
  nodeId: ObjectId;
}

export interface IMerkleTreeNodeDocument extends IMerkleTreeNode, Document {}

export interface IMerkleTreeNodeModel extends Model<IMerkleTreeNodeDocument> {
  findByLevelAndIndex: typeof findByLevelAndIndex;
}

export interface IMerkleTreeLeafDocument extends IMerkleTreeLeaf, Document {}

export interface IMerkleTreeLeafModel extends Model<IMerkleTreeLeafDocument> {
  //findLeafByIndex: typeof findLeafByIndex;
}
