import { Model, Document, ObjectId } from "mongoose";
import {
  findByLevelAndIndex,
  findLeafByIdCommitment,
  findZeroes,
  getNumberOfNodes,
} from "./MerkleTree.statics";

export interface IMerkleTreeNodeKey {
  groupId: string;
  level: number;
  index: number;
}

export interface IMerkleTreeNode {
  key: IMerkleTreeNodeKey;
  parent?: IMerkleTreeNode; // Root node has no parent
  hash: string;
}

export interface IMerkleTreeLeaf {
  groupId: string;
  idCommitment: string;
  node: IMerkleTreeNode;
}

export interface IMerkleTreeNodeDocument extends IMerkleTreeNode, Document {}

export interface IMerkleTreeNodeModel extends Model<IMerkleTreeNodeDocument> {
  findByLevelAndIndex: typeof findByLevelAndIndex;
  getNumberOfNodes: typeof getNumberOfNodes;
}

export interface IMerkleTreeLeafDocument extends IMerkleTreeLeaf, Document {}

export interface IMerkleTreeLeafModel extends Model<IMerkleTreeLeafDocument> {
  findLeafByIdCommitment: typeof findLeafByIdCommitment;
}

export interface IMerkleTreeZero {
  level: number;
  hash: string;
}

export interface IMerkleTreeZeroDocument extends IMerkleTreeZero, Document {}

export interface IMerkleTreeZeroModel extends Model<IMerkleTreeZeroDocument> {
  findZeroes: typeof findZeroes;
}
