import { ReputationLevel } from "@interrep/reputation-criteria";
import { poseidon } from "circomlib";
import { IncrementalQuinTree } from "incrementalquintree";
import { IMerkleTreeNodeDocument } from "src/models/merkleTree/MerkleTree.types";
import seedGroups from "src/utils/seeding/seedGroups";
import seedZeroHashes from "src/utils/seeding/seedRootHashes";
import config from "../config";
import { MerkleTreeNode } from "../models/merkleTree/MerkleTree.model";
import poseidonHash from "../utils/crypto/hasher";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "../utils/server/testDatabase";
import MerkleTreeController from "./MerkleTreeController";

describe("MerkleTreeController", () => {
  const idCommitment = poseidon([2n, 1n]).toString();
  const groupId = `TWITTER_${ReputationLevel.GOLD}`;
  const groups = [
    {
      groupId,
      description: "Twitter users with more than 7000 followers",
    },
  ];

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  describe("appendLeaf", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it("Should not append any leaf if the group id does not exist", async () => {
      await seedZeroHashes(false);

      const fun = (): Promise<string> =>
        MerkleTreeController.appendLeaf(groupId, idCommitment);

      await expect(fun).rejects.toThrow();
    });

    it("Should not append any leaf without first creating the zero hashes", async () => {
      await seedGroups(groups, false);

      const fun = (): Promise<string> =>
        MerkleTreeController.appendLeaf(groupId, idCommitment);

      await expect(fun).rejects.toThrow();
    });

    it("Should not append the same identity twice", async () => {
      await seedGroups(groups, false);
      await seedZeroHashes(false);

      await MerkleTreeController.appendLeaf(groupId, idCommitment);
      const fun = (): Promise<string> =>
        MerkleTreeController.appendLeaf(groupId, idCommitment);

      await expect(fun).rejects.toThrow();
    });

    it("Should append two leaves and their parent hash should match the hash of the id commitments", async () => {
      await seedGroups(groups, false);
      await seedZeroHashes(false);
      const idCommitments = [
        poseidon([1]).toString(),
        poseidon([2]).toString(),
      ];

      await MerkleTreeController.appendLeaf(groupId, idCommitments[0]);
      await MerkleTreeController.appendLeaf(groupId, idCommitments[1]);

      const node = (await MerkleTreeNode.findByLevelAndIndex({
        groupId,
        level: 1,
        index: 0,
      })) as IMerkleTreeNodeDocument;
      const hash = poseidonHash(idCommitments[0], idCommitments[1]);

      expect(hash).toBe(node.hash);
    });

    it("Should append 10 leaves correctly", async () => {
      await seedGroups(groups, false);
      await seedZeroHashes(false);

      for (let i = 0; i < 10; i++) {
        const idCommitment = poseidon([BigInt(i)]).toString();

        await MerkleTreeController.appendLeaf(groupId, idCommitment);
      }

      const expectedNumberOfNodes = [10, 5, 3, 2, 1, 1, 1];

      for (let i = 0; i < expectedNumberOfNodes.length; i++) {
        const numberOfNodes = await MerkleTreeNode.getNumberOfNodes(groupId, i);

        expect(numberOfNodes).toBe(expectedNumberOfNodes[i]);
      }
    });
  });

  describe("previewNewRoot", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it("Should not return the root hash if the group id does not exist", async () => {
      await seedZeroHashes(false);

      const fun = (): Promise<string> =>
        MerkleTreeController.previewNewRoot(groupId, idCommitment);

      await expect(fun).rejects.toThrow();
    });

    it("Should not calculate the root hash without first creating the zero hashes", async () => {
      await seedGroups(groups, false);

      const fun = (): Promise<string> =>
        MerkleTreeController.previewNewRoot(groupId, idCommitment);

      await expect(fun).rejects.toThrow();
    });

    it("Should return the right root hash", async () => {
      await seedGroups(groups, false);
      await seedZeroHashes(false);

      for (let i = 0; i < 10; i++) {
        const idCommitment = poseidon([BigInt(i)]).toString();

        const expectedRootHash = await MerkleTreeController.previewNewRoot(
          groupId,
          idCommitment
        );
        const rootHash = await MerkleTreeController.appendLeaf(
          groupId,
          idCommitment
        );

        expect(rootHash).toBe(expectedRootHash);
      }
    });
  });

  describe("retrievePath", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it(`Should not return any path if the identity commitment does not exist`, async () => {
      const fun = (): Promise<string[]> =>
        MerkleTreeController.retrievePath(groupId, idCommitment);

      await expect(fun).rejects.toThrow();
    });

    it(`Should return a path of ${config.TREE_LEVELS} hashes`, async () => {
      await seedGroups(groups, false);
      await seedZeroHashes(false);

      const idCommitments = [];

      for (let i = 0; i < 10; i++) {
        idCommitments.push(poseidon([BigInt(i)]).toString());

        await MerkleTreeController.appendLeaf(groupId, idCommitments[i]);
      }

      const path = await MerkleTreeController.retrievePath(
        groupId,
        idCommitments[5]
      );

      expect(path.pathElements.length).toBe(config.TREE_LEVELS);
      expect(path.indices.length).toBe(config.TREE_LEVELS);
    });

    it("Should match the path obtained with the 'incrementalquintree' library", async () => {
      await seedGroups(groups, false);
      await seedZeroHashes(false);

      const tree = new IncrementalQuinTree(
        config.TREE_LEVELS,
        0,
        2,
        (inputs: BigInt[]) => poseidon(inputs)
      );
      const idCommitments = [];

      for (let i = 0; i < 10; i++) {
        idCommitments.push(poseidon([BigInt(i)]).toString());

        await MerkleTreeController.appendLeaf(groupId, idCommitments[i]);
        tree.insert(BigInt(idCommitments[i]));
      }

      const path1 = await MerkleTreeController.retrievePath(
        groupId,
        idCommitments[5]
      );

      const path2 = tree.genMerklePath(5);
      const path2Elements = path2.pathElements.map((e: BigInt[]) =>
        e[0].toString()
      );

      expect(path1.indices).toStrictEqual(path2.indices);
      expect(path1.pathElements).toStrictEqual(path2Elements);
    });
  });
});
