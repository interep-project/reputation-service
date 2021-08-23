import { MerkleTreeNode, MerkleTreeLeaf } from "./MerkleTree.model";
import { IMerkleTreeNodeDocument, IMerkleTreeNodeKey, IMerkleTreeLeafDocument } from "./MerkleTree.types";

export async function findByLevelAndIndex(
  this: typeof MerkleTreeNode,
  key: IMerkleTreeNodeKey
): Promise<IMerkleTreeNodeDocument | null> {
  return this.findOne({ key });
}

// export async function findLeafByIndex(
//   this: typeof MerkleTreeLeaf,
//   index: number
// ): Promise<IMerkleTreeLeafDocument | null> {
//   return this.findOne({ index });
// }
