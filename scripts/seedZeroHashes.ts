import { dbConnect, dbDisconnect } from "src/utils/server/database";
import colors from "colors";
import { zeroBytes32 } from "src/utils/crypto/constants";
import config from "../src/config";
import { MerkleTreeZero } from "src/models/merkleTree/MerkleTree.model";
import mimcSpongeHash from "src/utils/crypto/hasher";

async function main(): Promise<void> {
  console.log(colors.white.bold("\nSeeding zero hashes...\n"));

  let level = 0;
  let zeroHash = zeroBytes32;

  const zeroHashes = await MerkleTreeZero.findZeroes();

  if (zeroHashes && zeroHashes.length > 0) {
    console.log(
      colors.white(`There are already ${zeroHashes.length} zero hashes!\n`)
    );

    level = zeroHashes.length;
    zeroHash = zeroHashes[level - 1].hash;
  }

  if (level < config.TREE_LEVELS) {
    for (level; level < config.TREE_LEVELS; level++) {
      const zeroHashDocument = await MerkleTreeZero.create({
        level,
        hash: mimcSpongeHash(zeroHash, zeroHash),
      });

      await zeroHashDocument.save();

      console.log(
        colors.white(`Document with id: ${zeroHashDocument.id} inserted`)
      );
    }

    console.log(colors.green.bold("\nDocuments inserted correctly ✓\n"));
  }
}

(async () => {
  dbConnect();

  try {
    await main();
    dbDisconnect();

    process.exit(0);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
})();
