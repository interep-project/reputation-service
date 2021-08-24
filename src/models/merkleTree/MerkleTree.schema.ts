import { Schema } from "mongoose";
import {
  findByLevelAndIndex,
  findLeafByIdCommitment,
  findZeroes,
  getNumberOfNodes,
} from "./MerkleTree.statics";
import {
  IMerkleTreeNode,
  IMerkleTreeNodeDocument,
  IMerkleTreeNodeModel,
  IMerkleTreeLeaf,
  IMerkleTreeLeafDocument,
  IMerkleTreeLeafModel,
  IMerkleTreeZero,
  IMerkleTreeZeroModel,
  IMerkleTreeZeroDocument,
} from "./MerkleTree.types";

// Node
const MerkleTreeNodeSchemaFields: Record<keyof IMerkleTreeNode, any> = {
  key: {
    groupId: String,
    level: Number,
    index: Number,
  },
  parent: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: "MerkleTreeNode",
  },
  hash: String,
};

export const MerkleTreeNodeSchema = new Schema<
  IMerkleTreeNodeDocument,
  IMerkleTreeNodeModel
>(MerkleTreeNodeSchemaFields);

MerkleTreeNodeSchema.statics.findByLevelAndIndex = findByLevelAndIndex;
MerkleTreeNodeSchema.statics.getNumberOfNodes = getNumberOfNodes;

// Leaf
const MerkleTreeLeafSchemaFields: Record<keyof IMerkleTreeLeaf, any> = {
  groupId: String,
  node: { type: Schema.Types.ObjectId, ref: "MerkleTreeNode" },
  idCommitment: String,
};

export const MerkleTreeLeafSchema = new Schema<
  IMerkleTreeLeafDocument,
  IMerkleTreeLeafModel
>(MerkleTreeLeafSchemaFields);

MerkleTreeLeafSchema.statics.findLeafByIdCommitment = findLeafByIdCommitment;

MerkleTreeLeafSchema.methods.getPath = function () {
  // TODO
};

// Zeroes
export const MerkleTreeZeroSchemaFields: Record<keyof IMerkleTreeZero, any> = {
  level: { type: Number, unique: true },
  hash: String,
};

export const MerkleTreeZeroSchema = new Schema<
  IMerkleTreeZeroDocument,
  IMerkleTreeZeroModel
>(MerkleTreeZeroSchemaFields);

MerkleTreeZeroSchema.statics.findZeroes = findZeroes;
