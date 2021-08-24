import {
  MerkleTreeLeaf,
  MerkleTreeNode,
  MerkleTreeZero,
} from "../models/merkleTree/MerkleTree.model";
import { IMerkleTreeNodeDocument } from "../models/merkleTree/MerkleTree.types";
import mimcSpongeHash from "../utils/crypto/hasher";
import config from "../config";
import { zeroBytes32 } from "src/utils/crypto/constants";

class MerkleTreeController {
  public appendLeaf = async (
    groupId: string,
    idCommitment: string
  ): Promise<string> => {
    // Get the zero hashes.
    const zeroes = await MerkleTreeZero.findZeroes();

    if (!zeroes || zeroes.length === 0) {
      throw new Error(`Zero hashes have not yet been created`);
    }

    // Add a leaf. Don't add to DB yet.
    const leaf = await MerkleTreeLeaf.create({
      groupId,
      node: null,
      idCommitment,
    });

    // TODO: check method for 1 arg.
    let hash = mimcSpongeHash(idCommitment, idCommitment);

    // Get next available index at level 0.
    let nextIndex = await MerkleTreeNode.getNumberOfNodes(groupId, 0);
    let prevNode: IMerkleTreeNodeDocument;
    let prevIndex: number;

    // TODO - need to handle a full tree?

    // Iterate up to root.
    for (let level = 0; level < config.TREE_LEVELS; level++) {
      let node: IMerkleTreeNodeDocument;

      if (level == 0) {
        // Create the leaf node.
        node = await MerkleTreeNode.create({
          key: { groupId, level, index: nextIndex },
          hash,
        });

        leaf.node = node.id;

        await leaf.save();
      } else {
        nextIndex = Math.floor(prevIndex / 2);

        if (nextIndex % 2 == 0) {
          // left node
          // hash with zero hash for this level
          hash = mimcSpongeHash(hash, zeroes[level].hash);

          // create new node
          node = await MerkleTreeNode.create({
            key: { groupId, level, index: nextIndex },
            hash,
          });
        } else {
          // right node
          // hash with left sibling from previous level
          const sibling = await MerkleTreeNode.findByLevelAndIndex({
            // key
            groupId,
            level: level - 1,
            index: prevIndex - 1,
          });

          hash = mimcSpongeHash(sibling.hash, hash);

          // update existing node
          node = await MerkleTreeNode.findByLevelAndIndex({
            groupId,
            level,
            index: nextIndex,
          });

          node.hash = hash;
        }

        prevNode.parent = node.id;

        await prevNode.save();
      }

      prevIndex = nextIndex;
      prevNode = node;
    }

    // Update contract with new root.
    return hash;
  };

  // public updateLeaf = async (groupId: string, idCommitment: string): Promise<any> => {
  //     // update leaf
  //     // Get index
  //     // Update hash
  //     // Iterate up to root
  //     // Update contract with new root
  // }

  // public getPath = async (groupId: string, idCommitment: string): Promise<string[]> => {
  //     // find leaf
  //     // get path starting from leaf node
  //     return [];
  // }

  // public getPathByIndex = async (groupId: string, index: number): Promise<string[]> => {
  //     // get path and return array
  //     return [];
  // }

  public createZeroHashes = async (): Promise<void> => {
    let currentLevel = 0;
    let zeroHash = zeroBytes32;

    const zeroHashes = await MerkleTreeZero.findZeroes();

    if (zeroHashes && zeroHashes.length > 0) {
      currentLevel = zeroHashes.length;
      zeroHash = zeroHashes[currentLevel - 1].hash;
    }

    for (let level = currentLevel; level < config.TREE_LEVELS; level++) {
      zeroHash = mimcSpongeHash(zeroHash, zeroHash);

      const zeroHashDocument = await MerkleTreeZero.create({
        level,
        hash: zeroHash,
      });

      try {
        await zeroHashDocument.save();
      } catch (error) {
        throw new Error(`Error inserting zero hash document: ${error}`);
      }
    }
  };
}

export default new MerkleTreeController();
