import { Model, Document } from "mongoose";
import {
  findByLevelAndIndex,
  findByHash,
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
  sibling?: IMerkleTreeNode | IMerkleTreeZero; // Root has no sibling
  hash: string;
}

export interface IMerkleTreeNodeDocument extends IMerkleTreeNode, Document {}

export interface IMerkleTreeNodeModel extends Model<IMerkleTreeNodeDocument> {
  findByLevelAndIndex: typeof findByLevelAndIndex;
  findByHash: typeof findByHash;
  getNumberOfNodes: typeof getNumberOfNodes;
}

export interface IMerkleTreeZero {
  level: number;
  hash: string;
}

export interface IMerkleTreeZeroDocument extends IMerkleTreeZero, Document {}

export interface IMerkleTreeZeroModel extends Model<IMerkleTreeZeroDocument> {
  findZeroes: typeof findZeroes;
}
