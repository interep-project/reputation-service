import config from "../config";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "../utils/server/testDatabase";
import MerkleTreeController from "./MerkleTreeController";

import { poseidon } from "circomlib";
import {
  MerkleTreeNode,
  MerkleTreeZero,
} from "../models/merkleTree/MerkleTree.model";

function createFakeIdCommitment(...values: BigInt[]): string {
  return poseidon(values);
}

describe("MerkleTreeController", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  describe("createZeroHashes", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it(`Should create ${config.TREE_LEVELS} zero hashes`, async () => {
      await MerkleTreeController.createZeroHashes();

      const zeroHashes = await MerkleTreeZero.findZeroes();

      expect(zeroHashes).not.toBeNull();
      expect(zeroHashes?.length).toBe(config.TREE_LEVELS);
    });
  });

  describe("appendLeaf", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it("Should not append any leaf without first creating the zero hashes", async () => {
      const groupId = "TWITTER_CONFIRMED";
      const idCommitment = createFakeIdCommitment(2n, 1n);

      const fun = (): Promise<string> =>
        MerkleTreeController.appendLeaf(groupId, idCommitment);

      await expect(fun).rejects.toThrow();
    });

    it("Should append 10 leaves correctly", async () => {
      await MerkleTreeController.createZeroHashes();

      for (let i = 0; i < 10; i++) {
        const idCommitment = createFakeIdCommitment(BigInt(i));

        await MerkleTreeController.appendLeaf(
          "TWITTER_CONFIRMED",
          idCommitment
        );
      }

      const numberOfNodes = await MerkleTreeNode.getNumberOfNodes(
        "TWITTER_CONFIRMED",
        0
      );

      expect(numberOfNodes).toBe(10);
    });
  });
});
