import { Schema } from "mongoose";
import { findByLevelAndIndex } from "./MerkleTree.statics";
import {
  IMerkleTreeNode,
  IMerkleTreeNodeDocument,
  IMerkleTreeNodeModel,
  IMerkleTreeNodeKey,
  IMerkleTreeLeaf,
  IMerkleTreeLeafDocument,
  IMerkleTreeLeafModel,
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

//MerkleTreeLeafSchema.statics.findLeafByIndex = findLeafByIndex;
