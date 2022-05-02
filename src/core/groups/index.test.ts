import { MerkleTreeRootBatch, MerkleTreeRootBatchDocument } from "@interep/db"
import { OAuthProvider, ReputationLevel } from "@interep/reputation"
import { poseidon } from "circomlibjs"
import config from "src/config"
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
                depth: config.MERKLE_TREE_DEPTH,
                root: "15019797232609675441998260052101280400536945603062888308240081994073687793470",
                numberOfLeaves: 0,
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
                depth: config.MERKLE_TREE_DEPTH,
                root: "2346325402389036006139851956948263441053316394607771938966160513162637822911",
                numberOfLeaves: 10,
                size: 10
            })
        })

        it("Should return the group the onchain root", async () => {
            const rootBatch = (await MerkleTreeRootBatch.findOne({
                group: { provider: OAuthProvider.TWITTER, name: ReputationLevel.GOLD },
                transaction: undefined
            })) as MerkleTreeRootBatchDocument

            rootBatch.transaction = {
                hash: "0x111",
                blockNumber: 1
            }

            await rootBatch.save()

            const idCommitment = poseidon([BigInt(11)]).toString()

            await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, idCommitment)

            const rootBatch2 = (await MerkleTreeRootBatch.findOne({
                group: { provider: OAuthProvider.TWITTER, name: ReputationLevel.GOLD },
                transaction: undefined
            })) as MerkleTreeRootBatchDocument

            rootBatch2.transaction = {
                hash: "0x222",
                blockNumber: 2
            }

            await rootBatch2.save()

            const expectedGroup = await getGroup(OAuthProvider.TWITTER, ReputationLevel.GOLD)

            expect(expectedGroup).toStrictEqual({
                provider: OAuthProvider.TWITTER,
                name: ReputationLevel.GOLD,
                depth: config.MERKLE_TREE_DEPTH,
                root: "11148132906138131584567320799756324174125089710919999370159441748514793203679",
                onchainRoot: "11148132906138131584567320799756324174125089710919999370159441748514793203679",
                numberOfLeaves: 11,
                size: 11
            })
        })
    })

    describe("# getGroups", () => {
        it("Should return all the existing groups", async () => {
            const expectedGroups = await getGroups()

            expect(expectedGroups).toContainEqual({
                provider: OAuthProvider.TWITTER,
                name: ReputationLevel.GOLD,
                depth: config.MERKLE_TREE_DEPTH,
                root: "11148132906138131584567320799756324174125089710919999370159441748514793203679",
                onchainRoot: "11148132906138131584567320799756324174125089710919999370159441748514793203679",
                numberOfLeaves: 11,
                size: 11
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
