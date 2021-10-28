import config from "src/config"
import colors from "colors"
import { MerkleTreeZero } from "@interrep/data-models"
import poseidonHash from "src/utils/common/crypto/hasher"

export default async function seedZeroHashes(logger = false): Promise<void> {
    const log = logger ? console.log : (message: string) => message

    log(colors.white.bold("Seeding zero hashes...\n"))

    let level = 0
    let zeroHash = "0"

    const zeroHashes = await MerkleTreeZero.findZeroes()

    if (zeroHashes && zeroHashes.length > 0) {
        log(colors.white(`There are already ${zeroHashes.length} zero hashes!\n`))

        level = zeroHashes.length
        zeroHash = zeroHashes[level - 1].hash
    }

    for (level; level < config.MERKLE_TREE_LEVELS; level++) {
        zeroHash = level === 0 ? zeroHash : poseidonHash(zeroHash, zeroHash)

        const zeroHashDocument = await MerkleTreeZero.create({
            level,
            hash: zeroHash
        })

        await zeroHashDocument.save()

        log(colors.white(`Document with id: ${zeroHashDocument.id} inserted`))
    }

    if (level === config.MERKLE_TREE_LEVELS) {
        log(colors.green.bold("\nDocuments inserted correctly ✓\n"))
    }
}
