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

const TEST_GROUP = "TWITTER_CONFIRMED";

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
      const groupId = TEST_GROUP;
      const idCommitment = createFakeIdCommitment(2n, 1n);

      const fun = (): Promise<string> =>
        MerkleTreeController.appendLeaf(groupId, idCommitment);

      await expect(fun).rejects.toThrow();
    });

    it("Should append 10 leaves correctly", async () => {
      await MerkleTreeController.createZeroHashes();

      const idCommitments = [];

      for (let i = 0; i < 10; i++) {
        const idCommitment = createFakeIdCommitment(BigInt(i));

        await MerkleTreeController.appendLeaf(
          TEST_GROUP,
          idCommitment
        );
        idCommitments.push(idCommitment);
      }

      const expectedNodes = [10, 5, 3, 2, 1, 1, 1];
      for (let i = 0; i<expectedNodes.length; i++) {
        const numberOfNodes = await MerkleTreeNode.getNumberOfNodes(
          TEST_GROUP,
          i
        );

        expect(numberOfNodes).toBe(expectedNodes[i]);
      }

      // Test path retrieve
      let path = await MerkleTreeController.getPathByIndex(TEST_GROUP, 1);
      console.log(`Path (1): ${JSON.stringify(path)}`);
      expect(path).toBeDefined();
      expect(path.length).toBe(config.TREE_LEVELS);

      path = await MerkleTreeController.getPathByIndex(TEST_GROUP, 7);
      console.log(`Path (7): ${JSON.stringify(path)}`);

      // Retrieve path by ID commitment  
      path = await MerkleTreeController.getPath(idCommitments[0]);
      console.log(`Path for ${idCommitments[0]}: ${JSON.stringify(path)}`);
      expect(path.length).toBe(config.TREE_LEVELS);

    });

  });
});
