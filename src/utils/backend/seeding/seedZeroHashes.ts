import config from "src/config"
import colors from "colors"
import { MerkleTreeZero } from "@interrep/db"
import { poseidon } from "src/utils/common/crypto"

export default async function seedZeroHashes(logger = false): Promise<void> {
    const log = logger ? console.log : (message: string) => message

    log(colors.white.bold("Seeding zero hashes...\n"))

    let level = 0
    let zeroHash = "0"

    const zeroHashes = await MerkleTreeZero.find()

    if (zeroHashes && zeroHashes.length > 0) {
        log(colors.white(`There are already ${zeroHashes.length} zero hashes!\n`))

        level = zeroHashes.length
        zeroHash = zeroHashes[level - 1].hash
    }

    if (level < config.MERKLE_TREE_DEPTH) {
        for (level; level < config.MERKLE_TREE_DEPTH; level++) {
            zeroHash = level === 0 ? zeroHash : poseidon(zeroHash, zeroHash)

            const zeroHashDocument = await MerkleTreeZero.create({
                level,
                hash: zeroHash
            })

            await zeroHashDocument.save()

            log(colors.white(`Document with id: ${zeroHashDocument.id} inserted`))
        }

        log(colors.green.bold("\nDocuments inserted correctly ✓\n"))
    }
}
