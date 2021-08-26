import {
  MerkleTreeNode,
  MerkleTreeZero,
} from "../models/merkleTree/MerkleTree.model";
import { IMerkleTreeNode, IMerkleTreeNodeDocument, IMerkleTreeZero } from "../models/merkleTree/MerkleTree.types";
import mimcSpongeHash from "../utils/crypto/hasher";
import config from "../config";
import Group from "src/models/groups/Group.model";

class MerkleTreeController {
  public appendLeaf = async (
    groupId: string,
    idCommitment: string
  ): Promise<string> => {
    if (await MerkleTreeNode.findByHash(idCommitment)) {
      throw new Error(`The identity commitment ${idCommitment} already exist`);
    }

    if (!(await Group.findByGroupId(groupId))) {
      throw new Error(`The group ${groupId} does not exist`);
    }

    // Get the zero hashes.
    const zeroes = await MerkleTreeZero.findZeroes();

    if (!zeroes || zeroes.length === 0) {
      throw new Error(`The zero hashes have not yet been created`);
    }

    // Get next available index at level 0.
    let currentIndex = await MerkleTreeNode.getNumberOfNodes(groupId, 0);

    if (currentIndex >= 2 ** config.TREE_LEVELS) {
      throw new Error(`The tree is full`);
    }

    let prevNode: IMerkleTreeNodeDocument | null = null;
    let hash = idCommitment;
    let prevIndex = 0;

    // Iterate up to root.
    for (let level = 0; level < config.TREE_LEVELS; level++) {
      let node: IMerkleTreeNodeDocument | null;

      if (level > 0) {
        currentIndex = Math.floor(prevIndex / 2);
        console.debug(`Level ${level} Index: ${currentIndex}`);
      }

      let sibling: IMerkleTreeNode | IMerkleTreeZero | null = null;
      let isLeft = false;
      if (currentIndex % 2 == 0) {
        // Left node. Set this level's zero as sibling
        sibling = zeroes[level];
        isLeft = true;
        //console.debug(`left node: sibling is zeroes`);
      } else {
        // Right node. Set each other as siblings.
        sibling = await MerkleTreeNode.findByLevelAndIndex({
          groupId, 
          level, 
          index: currentIndex - 1
        });
        //console.debug(`right node: sibling is index ${sibling?.key.index}`);
      }

      // Get parent node
      node = await MerkleTreeNode.findByLevelAndIndex({
        groupId,
        level,
        index: currentIndex,
      });

      if (prevNode !== null) {
        if (prevNode.sibling) {
          prevNode.populate('sibling');
          hash = mimcSpongeHash(prevNode.hash, prevNode.sibling.hash);
        }
      }

      // First time in a new branch the node needs to be created
      if (!node) {
        console.debug(`Create new node`);
          // Create new node.
          try {
            node = await MerkleTreeNode.create({
              key: { groupId, level, index: currentIndex },
              sibling: sibling,
              hash,
            });
          } catch (err) {
            console.error(`Error adding node: ${err.message}`);
          }
      } else {
        node.hash = hash;
        await node.save();
      }

      if (!isLeft) {
        console.debug(`r node: setting l node sibling to self`);
        const sib = (sibling as IMerkleTreeNodeDocument);
        sib.sibling = node;
        if (sib) await sib.save();
      }

      if (prevNode && !prevNode.populated('parent')) {
        prevNode.parent = node;
        await prevNode.save();
      }

      prevIndex = currentIndex;
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

  public retrievePath = async (idCommitment: string): Promise<string[]> => {
    // Get path starting from leaf node.
    const leafNode = await MerkleTreeNode.findByHash(idCommitment);

    if (!leafNode) {
      throw new Error(`The identity commitment ${idCommitment} does not exist`);
    }

    const { key } = leafNode;

    // Get path and return array.
    const pathQuery = MerkleTreeNode.aggregate([
      {
        $match: {
          key: key,
        },
      },
      {
        $graphLookup: {
          from: "treeNodes",
          startWith: "$_id",
          connectFromField: "parent",
          connectToField: "_id",
          as: "path",
          depthField: "level",
        },
      },
      {
        $unwind: {
          path: "$path",
        },
      },
      {
        $project: {
          path: 1,
          _id: 0,
        },
      },
      {
        $addFields: {
          hash: "$path.hash",
          level: "$path.level",
        },
      },
      {
        $sort: {
          level: 1,
        },
      },
      {
        $project: {
          path: 0,
        },
      },
    ]);

    return new Promise((resolve, reject) => {
      pathQuery.exec((error, path) => {
        if (error) {
          reject(error);
        }

        resolve(path.map((e) => e.hash));
      });
    });
  };
}

export default new MerkleTreeController();
