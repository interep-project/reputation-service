import { model, models } from "mongoose";
import { MerkleTreeLeafSchema, MerkleTreeNodeSchema } from "./MerkleTree.schema";
import { IMerkleTreeLeafDocument, IMerkleTreeLeafModel, IMerkleTreeNodeDocument, IMerkleTreeNodeModel } from "./MerkleTree.types";

const NODE_MODEL_NAME = "MerkleTreeNode";
const LEAF_MODEL_NAME = "MerkleTreeLeaf";

// Because of Next.js HMR we need to get the model if it was already compiled
export const MerkleTreeNode: IMerkleTreeNodeModel =
  (models[NODE_MODEL_NAME] as IMerkleTreeNodeModel) ||
  model<IMerkleTreeNodeDocument, IMerkleTreeNodeModel>(NODE_MODEL_NAME, MerkleTreeNodeSchema, "treeNodes");

export const MerkleTreeLeaf: IMerkleTreeLeafModel =
  (models[LEAF_MODEL_NAME] as IMerkleTreeLeafModel) ||
  model<IMerkleTreeLeafDocument, IMerkleTreeLeafModel>(LEAF_MODEL_NAME, MerkleTreeLeafSchema, "treeLeaves");

