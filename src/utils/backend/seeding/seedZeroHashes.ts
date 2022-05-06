import { MerkleTreeZero } from "@interep/db"
import { logger } from "src/utils/backend"
import { poseidon } from "src/utils/common/crypto"

export default async function seedZeroHashes(): Promise<void> {
    logger.verbose("Seeding zero hashes...")

    let level = 0
    let zeroHash = "0"

    const zeroHashes = await MerkleTreeZero.find()

    if (zeroHashes && zeroHashes.length > 0) {
        level = zeroHashes.length
        zeroHash = zeroHashes[level - 1].hash
    }

    for (level; level < 32; level++) {
        zeroHash = level === 0 ? zeroHash : poseidon(zeroHash, zeroHash)

        await MerkleTreeZero.create({
            level,
            hash: zeroHash
        })

        logger.verbose(`Zero hash '${zeroHash}' has been inserted`)
    }

    logger.info("All the zero hashes have been inserted correctly")
}
