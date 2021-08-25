import { poseidon } from "circomlib";
import { seedGroups, seedZeroHashes } from "scripts/seeding/seedingFunctions";
import { IMerkleTreeNodeDocument } from "src/models/merkleTree/MerkleTree.types";
import { MerkleTreeNode } from "../models/merkleTree/MerkleTree.model";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "../utils/server/testDatabase";
import mimcSpongeHash from "../utils/crypto/hasher";
import MerkleTreeController from "./MerkleTreeController";
import config from "../config";

describe("MerkleTreeController", () => {
  const idCommitment = poseidon([2n, 1n]);
  const groupId = "TWITTER_CONFIRMED";
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

    it("Should append two leaves and their parent hash should match the Mimc hash of the id commitments", async () => {
      await seedGroups(groups, false);
      await seedZeroHashes(false);
      const idCommitments = [poseidon([1]), poseidon([2])];

      await MerkleTreeController.appendLeaf(groupId, idCommitments[0]);
      await MerkleTreeController.appendLeaf(groupId, idCommitments[1]);

      const node = (await MerkleTreeNode.findByLevelAndIndex({
        groupId,
        level: 1,
        index: 0,
      })) as IMerkleTreeNodeDocument;
      const hash = mimcSpongeHash(idCommitments[0], idCommitments[1]);

      expect(hash).toBe(node.hash);
    });

    it("Should append 10 leaves correctly", async () => {
      await seedGroups(groups, false);
      await seedZeroHashes(false);

      for (let i = 0; i < 10; i++) {
        const idCommitment = poseidon([BigInt(i)]);

        await MerkleTreeController.appendLeaf(groupId, idCommitment);
      }

      const expectedNumberOfNodes = [10, 5, 3, 2, 1, 1, 1];

      for (let i = 0; i < expectedNumberOfNodes.length; i++) {
        const numberOfNodes = await MerkleTreeNode.getNumberOfNodes(groupId, i);

        expect(numberOfNodes).toBe(expectedNumberOfNodes[i]);
      }
    });
  });

  describe("retrievePath", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it(`Should return a path of ${config.TREE_LEVELS} hashes`, async () => {
      await seedGroups(groups, false);
      await seedZeroHashes(false);

      const idCommitments = [];

      for (let i = 0; i < 10; i++) {
        idCommitments.push(poseidon([BigInt(i)]));

        await MerkleTreeController.appendLeaf(groupId, idCommitments[i]);
      }

      const path = (await MerkleTreeController.retrievePath(
        idCommitments[0]
      )) as string[];

      expect(path.length).toBe(config.TREE_LEVELS);
    });
  });
});
