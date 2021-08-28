import { zeroBytes32 } from "src/utils/crypto/constants";
import config from "src/config";
import colors from "colors";
import { MerkleTreeZero } from "src/models/merkleTree/MerkleTree.model";
import mimcSpongeHash from "src/utils/crypto/hasher";

export default async function seedZeroHashes(logger = false): Promise<void> {
  const log = logger ? console.log : (message: string) => message;

  log(colors.white.bold("\nSeeding zero hashes...\n"));

  let level = 0;
  let zeroHash = zeroBytes32;

  const zeroHashes = await MerkleTreeZero.findZeroes();

  if (zeroHashes && zeroHashes.length > 0) {
    log(colors.white(`There are already ${zeroHashes.length} zero hashes!\n`));

    level = zeroHashes.length;
    zeroHash = zeroHashes[level - 1].hash;
  }

  if (level < config.TREE_LEVELS) {
    for (level; level < config.TREE_LEVELS; level++) {
      zeroHash = mimcSpongeHash(zeroHash, zeroHash);

      const zeroHashDocument = await MerkleTreeZero.create({
        level,
        hash: zeroHash,
      });

      await zeroHashDocument.save();

      log(colors.white(`Document with id: ${zeroHashDocument.id} inserted`));
    }

    log(colors.green.bold("\nDocuments inserted correctly ✓\n"));
  }
}
