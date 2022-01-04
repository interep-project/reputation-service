import { MerkleTreeZero, OAuthAccount } from "@interrep/db"
import { OAuthProvider, ReputationLevel } from "@interrep/reputation"
import config from "src/config"
import { connectTestingDatabase, disconnectTestingDatabase } from "src/utils/backend/database"
import { seedTwitterUsers } from "."
import seedZeroHashes from "./seedZeroHashes"

jest.mock("src/services/twitter", () => ({
    __esModule: true,
    getTwitterUserByUsername: jest.fn(({ username }: any) => ({
        id: username.length
    }))
}))

describe("# utils/backend/seeding", () => {
    beforeAll(async () => {
        await connectTestingDatabase()
    })

    afterAll(async () => {
        await disconnectTestingDatabase()
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

    describe("# seedTwitterUsers", () => {
        it(`Should add two Twitter users in the db`, async () => {
            await seedTwitterUsers(["elonmusk", "vitalikButerin"])

            const expectedValue1 = await OAuthAccount.countDocuments()
            const expectedValue2 = await OAuthAccount.findByProviderAccountId(OAuthProvider.TWITTER, "8")

            expect(expectedValue1).toBe(2)
            expect(expectedValue2).not.toBeNull()
            expect(expectedValue2?.reputation).toBe(ReputationLevel.GOLD)
        })

        it("Should not add any Twitter user if they are already there", async () => {
            await seedTwitterUsers(["elonmusk", "vitalikButerin"])

            const expectedValue = await OAuthAccount.countDocuments()

            expect(expectedValue).toBe(2)
        })
    })
})
