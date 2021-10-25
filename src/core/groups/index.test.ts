import { ReputationLevel, Web2Provider } from "@interrep/reputation-criteria"
import { poseidon } from "circomlib"
import { appendLeaf } from "src/core/groups/mts"
import { Web3Provider } from "src/types/groups"
import seedZeroHashes from "src/utils/backend/seeding/seedZeroHashes"
import { clearDatabase, connect, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import { checkGroup, getAllProviders, getGroup, getGroups } from "."
import { PoapGroupName } from "./poap"

describe("Core group functions", () => {
    describe("Check group", () => {
        it("Should return true if a group exists", () => {
            const expectedValue = checkGroup(Web2Provider.TWITTER, ReputationLevel.GOLD)

            expect(expectedValue).toBeTruthy()
        })

        it("Should return false if a group does not exist", () => {
            const expectedValue = checkGroup(Web2Provider.TWITTER, PoapGroupName.DEVCON_3)

            expect(expectedValue).toBeFalsy()
        })
    })

    describe("Get group", () => {
        beforeAll(async () => {
            await connect()
        })

        afterAll(async () => {
            await dropDatabaseAndDisconnect()
        })

        it("Should return the correct group", async () => {
            const expectedValue = await getGroup(Web2Provider.TWITTER, ReputationLevel.GOLD)

            expect(expectedValue).toStrictEqual({
                name: ReputationLevel.GOLD,
                provider: Web2Provider.TWITTER,
                size: 0
            })
        })

        it("Should return false if a group does not exist", async () => {
            await seedZeroHashes(false)

            for (let i = 0; i < 10; i++) {
                const idCommitment = poseidon([BigInt(i)]).toString()

                await appendLeaf(Web2Provider.TWITTER, ReputationLevel.GOLD, idCommitment)
            }

            const expectedGroup = await getGroup(Web2Provider.TWITTER, ReputationLevel.GOLD)

            expect(expectedGroup).toStrictEqual({
                name: ReputationLevel.GOLD,
                provider: Web2Provider.TWITTER,
                size: 10
            })
        })
    })

    describe("Get groups", () => {
        beforeAll(async () => {
            await connect()
        })

        afterAll(async () => {
            await dropDatabaseAndDisconnect()
        })

        afterEach(async () => {
            await clearDatabase()
        })

        it("Should return all the existing groups", async () => {
            const expectedGroups = await getGroups()

            expect(expectedGroups).toContainEqual({
                name: ReputationLevel.GOLD,
                provider: Web2Provider.TWITTER,
                size: 0
            })
        })
    })

    describe("Get all providers", () => {
        it("Should return all the existing providers", async () => {
            const expectedValue = getAllProviders()

            expect(expectedValue).toContainEqual(Web3Provider.POAP)
            expect(expectedValue).toContainEqual(Web2Provider.TWITTER)
        })
    })
})
