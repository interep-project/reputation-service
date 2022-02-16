import { OAuthProvider, ReputationLevel } from "@interep/reputation"
import { poseidon } from "circomlibjs"
import { appendLeaf } from "src/core/groups/mts"
import { PoapEvent } from "src/core/poap"
import { seedZeroHashes } from "src/utils/backend/seeding"
import { clearDatabase, connectDatabase, disconnectDatabase } from "src/utils/backend/testingDatabase"
import { checkGroup, getGroup, getGroups, getProviders } from "."

describe("# core/groups", () => {
    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await clearDatabase()
        await disconnectDatabase()
    })

    describe("# checkGroup", () => {
        it("Should return true if a group exists", () => {
            const expectedValue = checkGroup(OAuthProvider.TWITTER, ReputationLevel.GOLD)

            expect(expectedValue).toBeTruthy()
        })

        it("Should return false if a group does not exist", () => {
            const expectedValue = checkGroup(OAuthProvider.TWITTER, PoapEvent.DEVCON_3)

            expect(expectedValue).toBeFalsy()
        })
    })

    describe("# getGroup", () => {
        it("Should fail if the group does not exist", async () => {
            const fun = () => getGroup(OAuthProvider.TWITTER, PoapEvent.DEVCON_3)

            await expect(fun).rejects.toThrow("does not exist")
        })

        it("Should return the correct group", async () => {
            const expectedValue = await getGroup(OAuthProvider.TWITTER, ReputationLevel.GOLD)

            expect(expectedValue).toStrictEqual({
                provider: OAuthProvider.TWITTER,
                name: ReputationLevel.GOLD,
                rootHash: "19217088683336594659449020493828377907203207941212636669271704950158751593251",
                size: 0
            })
        })

        it("Should return the group with size = 10", async () => {
            await seedZeroHashes()

            for (let i = 0; i < 10; i++) {
                const idCommitment = poseidon([BigInt(i)]).toString()

                await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, idCommitment)
            }

            const expectedGroup = await getGroup(OAuthProvider.TWITTER, ReputationLevel.GOLD)

            expect(expectedGroup).toStrictEqual({
                provider: OAuthProvider.TWITTER,
                name: ReputationLevel.GOLD,
                rootHash: "7823274241651847725886395043906089812509000229670073074851496209925190006195",
                size: 10
            })
        })
    })

    describe("# getGroups", () => {
        it("Should return all the existing groups", async () => {
            const expectedGroups = await getGroups()

            expect(expectedGroups).toContainEqual({
                provider: OAuthProvider.TWITTER,
                name: ReputationLevel.GOLD,
                rootHash: "7823274241651847725886395043906089812509000229670073074851496209925190006195",
                size: 10
            })
        })
    })

    describe("# getProviders", () => {
        it("Should return all the existing providers", async () => {
            const expectedValue = getProviders()

            expect(expectedValue).toContainEqual("poap")
            expect(expectedValue).toContainEqual(OAuthProvider.TWITTER)
        })
    })
})
