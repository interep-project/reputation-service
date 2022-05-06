import { MerkleTreeZero } from "@interep/db"
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
        it(`Should add 32 zero hashes in the db`, async () => {
            await seedZeroHashes()

            const expectedValue = await MerkleTreeZero.countDocuments()

            expect(expectedValue).toBe(32)
        })

        it("Should not add any zero hash if they are already there", async () => {
            await seedZeroHashes()

            const expectedValue = await MerkleTreeZero.countDocuments()

            expect(expectedValue).toBe(32)
        })
    })
})
