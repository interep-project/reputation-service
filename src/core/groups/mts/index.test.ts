import { MerkleTreeNode, MerkleTreeNodeDocument, MerkleTreeRootBatch, MerkleTreeRootBatchDocument } from "@interep/db"
import { OAuthProvider, ReputationLevel } from "@interep/reputation"
import { merkleTreeDepths } from "src/config"
import { PoapEvent } from "src/core/poap"
import { seedZeroHashes } from "src/utils/backend/seeding"
import { clearDatabase, connectDatabase, disconnectDatabase } from "src/utils/backend/testingDatabase"
import { createIncrementalMerkleTree, poseidon } from "src/utils/common/crypto"
import { appendLeaf, createProof, deleteLeaf } from "."

describe("# core/groups/mts", () => {
    const idCommitment = poseidon(2, 1)
    const provider = OAuthProvider.TWITTER
    const reputation = ReputationLevel.GOLD

    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    describe("# appendLeaf", () => {
        beforeEach(async () => {
            await clearDatabase()
        })

        it("Should not append any leaf if the group id does not exist", async () => {
            await seedZeroHashes()

            const fun = () => appendLeaf(provider, PoapEvent.DEVCON_3, idCommitment)

            await expect(fun).rejects.toThrow("does not exist")
        })

        it("Should not append any leaf without first creating the zero hashes", async () => {
            const fun = () => appendLeaf(provider, reputation, idCommitment)

            await expect(fun).rejects.toThrow("not yet been created")
        })

        it("Should not append the same identity twice", async () => {
            await seedZeroHashes()
            await appendLeaf(provider, reputation, idCommitment)

            const fun = () => appendLeaf(provider, reputation, idCommitment)

            await expect(fun).rejects.toThrow("already exist")
        })

        it("Should append two leaves and their parent hash should match the hash of the id commitments", async () => {
            await seedZeroHashes()
            const idCommitments = [poseidon(1), poseidon(2)]
            const hash = poseidon(idCommitments[0], idCommitments[1])

            await appendLeaf(provider, reputation, idCommitments[0])
            await appendLeaf(provider, reputation, idCommitments[1])

            const expectedValue = (await MerkleTreeNode.findByGroupAndLevelAndIndex(
                { provider, name: reputation },
                1,
                0
            )) as MerkleTreeNodeDocument

            expect(expectedValue).not.toBeNull()
            expect(expectedValue.hash).toBe(hash)
        })

        it("Should create a root batch without transaction if it does not exist", async () => {
            await seedZeroHashes()
            const idCommitments = [1, 2].map((v) => poseidon(v))

            await appendLeaf(provider, reputation, idCommitments[0].toString())
            await appendLeaf(provider, reputation, idCommitments[1].toString())

            const expectedValue = (await MerkleTreeRootBatch.findOne({
                group: { provider, name: reputation },
                transaction: undefined
            })) as MerkleTreeRootBatchDocument

            expect(expectedValue).not.toBeNull()
        })

        it("Should append 10 leaves correctly", async () => {
            await seedZeroHashes()

            for (let i = 0; i < 10; i++) {
                const idCommitment = poseidon(i)

                await appendLeaf(provider, reputation, idCommitment)
            }

            const expectedNumberOfNodes = [10, 5, 3, 2, 1, 1, 1]

            for (let i = 0; i < expectedNumberOfNodes.length; i++) {
                const numberOfNodes = await MerkleTreeNode.getNumberOfNodes({ provider, name: reputation }, i)

                expect(numberOfNodes).toBe(expectedNumberOfNodes[i])
            }
        })
    })

    describe("# deleteLeaf", () => {
        beforeEach(async () => {
            await clearDatabase()
        })

        it("Should not delete any leaf if the group id does not exist", async () => {
            const fun = () => deleteLeaf(provider, PoapEvent.DEVCON_3, idCommitment)

            await expect(fun).rejects.toThrow("does not exist")
        })

        it("Should not delete any leaf without first creating the zero hashes", async () => {
            const fun = () => deleteLeaf(provider, reputation, idCommitment)

            await expect(fun).rejects.toThrow("not yet been created")
        })

        it("Should not delete any leaf if it does not exist", async () => {
            await seedZeroHashes()

            const fun = () => deleteLeaf(provider, reputation, idCommitment)

            await expect(fun).rejects.toThrow("does not exist")
        })

        it("Should delete a leaf", async () => {
            await seedZeroHashes()
            const idCommitments = [1, 2].map((v) => poseidon(v))

            await appendLeaf(provider, reputation, idCommitments[0].toString())
            await appendLeaf(provider, reputation, idCommitments[1].toString())

            const expectedValue = await deleteLeaf(provider, reputation, idCommitments[0].toString())

            const tree = createIncrementalMerkleTree(provider)

            tree.insert(idCommitments[0])
            tree.insert(idCommitments[1])
            tree.delete(0)

            expect(expectedValue).toBe(tree.root)
        })

        it("Should create a root batch without transaction if it does not exist", async () => {
            await seedZeroHashes()
            const idCommitments = [1, 2].map((v) => poseidon(v))

            await appendLeaf(provider, reputation, idCommitments[0].toString())
            await appendLeaf(provider, reputation, idCommitments[1].toString())

            const rootBatch = (await MerkleTreeRootBatch.findOne({
                group: { provider, name: reputation },
                transaction: undefined
            })) as MerkleTreeRootBatchDocument

            rootBatch.transaction = {
                hash: "0x000",
                blockNumber: 0
            }

            await rootBatch.save()

            await deleteLeaf(provider, reputation, idCommitments[0].toString())

            const expectedValue = (await MerkleTreeRootBatch.findOne({
                group: { provider, name: reputation },
                transaction: undefined
            })) as MerkleTreeRootBatchDocument

            expect(expectedValue).not.toBeNull()
        })

        it("Should delete 5 leaves correctly", async () => {
            const tree = createIncrementalMerkleTree(provider)

            await seedZeroHashes()

            for (let i = 0; i < 10; i++) {
                const idCommitment = poseidon(i)

                await appendLeaf(provider, reputation, idCommitment.toString())
                tree.insert(idCommitment)
            }

            for (let i = 0; i < 5; i++) {
                const idCommitment = poseidon(i)
                tree.delete(i)

                const expectedValue = await deleteLeaf(provider, reputation, idCommitment.toString())

                expect(expectedValue).toBe(tree.root)
            }
        })
    })

    describe("# createProof", () => {
        beforeEach(async () => {
            await clearDatabase()
        })

        it("Should not return any proof if the group id does not exist", async () => {
            const fun = () => createProof(provider, PoapEvent.DEVCON_3, idCommitment)

            await expect(fun).rejects.toThrow("does not exist")
        })

        it(`Should not return any proof if the identity commitment does not exist`, async () => {
            const fun = () => createProof(provider, reputation, idCommitment)

            await expect(fun).rejects.toThrow("does not exist")
        })

        it(`Should return a proof of ${merkleTreeDepths[provider]} hashes`, async () => {
            await seedZeroHashes()

            const idCommitments = []

            for (let i = 0; i < 10; i++) {
                idCommitments.push(poseidon(i))

                await appendLeaf(provider, reputation, idCommitments[i])
            }

            const expectedValue = await createProof(provider, reputation, idCommitments[5])

            expect(expectedValue.siblings).toHaveLength(merkleTreeDepths[provider])
            expect(expectedValue.pathIndices).toHaveLength(merkleTreeDepths[provider])
        })

        it("Should match the proof obtained with the 'incrementalquintree' library", async () => {
            await seedZeroHashes()

            const tree = createIncrementalMerkleTree(provider)
            const idCommitments = []

            for (let i = 0; i < 10; i++) {
                idCommitments.push(poseidon(i))

                await appendLeaf(provider, reputation, idCommitments[i])
                tree.insert(BigInt(idCommitments[i]))
            }

            const { pathIndices, siblings } = tree.createProof(5)
            const expectedValue = await createProof(provider, reputation, idCommitments[5])

            expect(expectedValue.siblings).toStrictEqual(siblings.map(String))
            expect(expectedValue.pathIndices).toStrictEqual(pathIndices)
        })
    })
})
