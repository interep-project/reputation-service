import { Schema } from "mongoose";
import { findByLevelAndIndex, findLeafByIdCommitment } from "./MerkleTree.statics";
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
  parent: { type: Schema.Types.ObjectId, required: false },
  hash: String,
};

export const MerkleTreeNodeSchema = new Schema<IMerkleTreeNodeDocument, IMerkleTreeNodeModel>(MerkleTreeNodeSchemaFields);

MerkleTreeNodeSchema.statics.findByLevelAndIndex = findByLevelAndIndex;

// Leaf
const MerkleTreeLeafSchemaFields: Record<keyof IMerkleTreeLeaf, any> = {  
  groupId: String,
  nodeId: Schema.Types.ObjectId,
  idCommitment: String,
};

export const MerkleTreeLeafSchema = new Schema<IMerkleTreeLeafDocument, IMerkleTreeLeafModel>(MerkleTreeLeafSchemaFields);

MerkleTreeLeafSchema.statics.findLeafByIdCommitment = findLeafByIdCommitment;

// Zeroes
export const MerkleTreeZeroSchemaFields: Record<keyof IMerkleTreeZero, any> = {
  level: Number,
  hash: String,
}

export const MerkleTreeZeroSchema = new Schema<IMerkleTreeZeroDocument, IMerkleTreeZeroModel>(MerkleTreeZeroSchemaFields);

