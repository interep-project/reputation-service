import { MerkleTreeZero } from "@interrep/db"
import config from "src/config"
import { connectDatabase, disconnectDatabase } from "src/utils/backend/testingDatabase"
import seedZeroHashes from "./seedZeroHashes"

describe("# utils/backend/seeding", () => {
    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    describe("# seedZeroHashes", () => {
        it(`Should add ${config.MERKLE_TREE_DEPTH} zero hashes in the db`, async () => {
            await seedZeroHashes()

            const expectedValue = await MerkleTreeZero.countDocuments()

            expect(expectedValue).toBe(config.MERKLE_TREE_DEPTH)
        })

        it("Should not add any zero hash if they are already there", async () => {
            await seedZeroHashes()

            const expectedValue = await MerkleTreeZero.countDocuments()

            expect(expectedValue).toBe(config.MERKLE_TREE_DEPTH)
        })
    })
})
