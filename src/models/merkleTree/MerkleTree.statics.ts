import { MerkleTreeLeaf, MerkleTreeNode, MerkleTreeZero } from "./MerkleTree.model";
import { IMerkleTreeLeafDocument, IMerkleTreeNodeDocument, IMerkleTreeNodeKey, IMerkleTreeZeroDocument } from "./MerkleTree.types";

export async function findByLevelAndIndex(
  this: typeof MerkleTreeNode,
  key: IMerkleTreeNodeKey
): Promise<IMerkleTreeNodeDocument | null> {
  return this.findOne({ key })
    .populate('parent');
}

export async function findLeafByIdCommitment(
  this: typeof MerkleTreeLeaf,
  idCommitment: string,
): Promise<IMerkleTreeLeafDocument | null> {
  return this.findOne({ idCommitment })
    .populate('node');
}

export async function findZeroes(
  this: typeof MerkleTreeZero
): Promise<IMerkleTreeZeroDocument[] | null> {
  return this.find();
}
