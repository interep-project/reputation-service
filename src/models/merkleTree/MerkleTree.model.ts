import { model, models } from "mongoose";
import { MerkleTreeLeafSchema, MerkleTreeNodeSchema, MerkleTreeZeroSchema } from "./MerkleTree.schema";
import { IMerkleTreeLeafDocument, IMerkleTreeLeafModel, IMerkleTreeNodeDocument, IMerkleTreeNodeModel, IMerkleTreeZeroDocument, IMerkleTreeZeroModel } from "./MerkleTree.types";

const NODE_MODEL_NAME = "MerkleTreeNode";
const LEAF_MODEL_NAME = "MerkleTreeLeaf";
const ZERO_MODEL_NAME = "MerkleTreeZero";

// Because of Next.js HMR we need to get the model if it was already compiled
export const MerkleTreeNode: IMerkleTreeNodeModel =
  (models[NODE_MODEL_NAME] as IMerkleTreeNodeModel) ||
  model<IMerkleTreeNodeDocument, IMerkleTreeNodeModel>(NODE_MODEL_NAME, MerkleTreeNodeSchema, "treeNodes");

export const MerkleTreeLeaf: IMerkleTreeLeafModel =
  (models[LEAF_MODEL_NAME] as IMerkleTreeLeafModel) ||
  model<IMerkleTreeLeafDocument, IMerkleTreeLeafModel>(LEAF_MODEL_NAME, MerkleTreeLeafSchema, "treeLeaves");

export const MerkleTreeZero: IMerkleTreeZeroModel = 
  (models[ZERO_MODEL_NAME] as IMerkleTreeZeroModel) ||
  model<IMerkleTreeZeroDocument, IMerkleTreeZeroModel>(ZERO_MODEL_NAME, MerkleTreeZeroSchema, "treeZeroes"); 

