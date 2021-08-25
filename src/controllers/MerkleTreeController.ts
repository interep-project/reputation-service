import {
  MerkleTreeNode,
  MerkleTreeZero,
} from "../models/merkleTree/MerkleTree.model";
import { IMerkleTreeNodeDocument } from "../models/merkleTree/MerkleTree.types";
import mimcSpongeHash from "../utils/crypto/hasher";
import config from "../config";
import Group from "src/models/groups/Group.model";

class MerkleTreeController {
  public appendLeaf = async (
    groupId: string,
    idCommitment: string
  ): Promise<string> => {
    if (!(await Group.findByGroupId(groupId))) {
      throw new Error(`The group ${groupId} does not exist`);
    }

    // Get the zero hashes.
    const zeroes = await MerkleTreeZero.findZeroes();

    if (!zeroes || zeroes.length === 0) {
      throw new Error(`The zero hashes have not yet been created`);
    }

    // Get next available index at level 0.
    let nextIndex = await MerkleTreeNode.getNumberOfNodes(groupId, 0);

    if (nextIndex >= 2 ** config.TREE_LEVELS) {
      throw new Error(`The tree is full`);
    }

    let prevNode: IMerkleTreeNodeDocument | null = null;
    let hash = idCommitment;
    let prevIndex = 0;

    // Iterate up to root.
    for (let level = 0; level < config.TREE_LEVELS; level++) {
      let node: IMerkleTreeNodeDocument | null;

      if (level == 0) {
        // Create the leaf node.
        node = await MerkleTreeNode.create({
          key: { groupId, level, index: nextIndex },
          hash,
        });
      } else {
        nextIndex = Math.floor(prevIndex / 2);

        if (prevIndex % 2 == 0) {
          // left child node
          // hash with zero hash for that level
          hash = mimcSpongeHash(hash, zeroes[level - 1].hash);

          // Get parent node
          node = await MerkleTreeNode.findByLevelAndIndex({
            groupId,
            level,
            index: nextIndex,
          });
          // First time in a new branch these need to be created
          if (!node) {
            // create new parent node
            node = await MerkleTreeNode.create({
              key: { groupId, level, index: nextIndex },
              hash,
            });
          } else {
            node.hash = hash;
            await node.save();
          }
        } else {
          // right node
          // hash with left sibling from previous level
          const sibling = await MerkleTreeNode.findByLevelAndIndex({
            // key
            groupId,
            level: level - 1,
            index: prevIndex - 1,
          });

          if (!sibling) {
            throw new Error(`Sibling not found for ${level - 1}, ${prevIndex}`);
          }

          hash = mimcSpongeHash(sibling.hash, hash);

          // update existing node
          node = await MerkleTreeNode.findByLevelAndIndex({
            groupId,
            level,
            index: nextIndex,
          });

          if (!node) {
            throw new Error(`Node not found at ${level}, ${nextIndex}`);
          }

          node.hash = hash;
          await node.save();
        }

        if (prevNode) {
          prevNode.parent = node;

          await prevNode.save();
        }
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

  public retrievePath = async (idCommitment: string): Promise<string[]> => {
    // Get path starting from leaf node.
    const { key } = (await MerkleTreeNode.findByHash(
      idCommitment
    )) as IMerkleTreeNodeDocument;

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
