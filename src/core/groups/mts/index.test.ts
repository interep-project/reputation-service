import { Web2Provider } from "@interrep/reputation-criteria"
import { poseidon } from "circomlib"
import { IncrementalQuinTree } from "incrementalquintree"
import { getGroupIds } from "src/core/groups"
import { IMerkleTreeNodeDocument } from "src/models/merkleTree/MerkleTree.types"
import seedZeroHashes from "src/utils/backend/seeding/seedZeroHashes"
import config from "src/config"
import { MerkleTreeNode } from "src/models/merkleTree/MerkleTree.model"
import { clearDatabase, connect, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import poseidonHash from "src/utils/common/crypto/hasher"
import { appendLeaf, previewNewRoot, retrievePath } from "."

describe("Merkle Trees", () => {
    const idCommitment = poseidon([2n, 1n]).toString()
    const groupId = getGroupIds(Web2Provider.TWITTER)[0]

    beforeAll(async () => {
        await connect()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    describe("appendLeaf", () => {
        beforeEach(async () => {
            await clearDatabase()
        })

        it("Should not append any leaf if the group id does not exist", async () => {
            await seedZeroHashes(false)

            const fun = (): Promise<string> => appendLeaf("WRONG_GROUP_ID", idCommitment)

            await expect(fun).rejects.toThrow()
        })

        it("Should not append any leaf without first creating the zero hashes", async () => {
            const fun = (): Promise<string> => appendLeaf(groupId, idCommitment)

            await expect(fun).rejects.toThrow()
        })

        it("Should not append the same identity twice", async () => {
            await seedZeroHashes(false)

            await appendLeaf(groupId, idCommitment)
            const fun = (): Promise<string> => appendLeaf(groupId, idCommitment)

            await expect(fun).rejects.toThrow()
        })

        it("Should append two leaves and their parent hash should match the hash of the id commitments", async () => {
            await seedZeroHashes(false)
            const idCommitments = [poseidon([1]).toString(), poseidon([2]).toString()]

            await appendLeaf(groupId, idCommitments[0])
            await appendLeaf(groupId, idCommitments[1])

            const node = (await MerkleTreeNode.findByLevelAndIndex({
                groupId,
                level: 1,
                index: 0
            })) as IMerkleTreeNodeDocument
            const hash = poseidonHash(idCommitments[0], idCommitments[1])

            expect(hash).toBe(node.hash)
        })

        it("Should append 10 leaves correctly", async () => {
            await seedZeroHashes(false)

            for (let i = 0; i < 10; i++) {
                const idCommitment = poseidon([BigInt(i)]).toString()

                await appendLeaf(groupId, idCommitment)
            }

            const expectedNumberOfNodes = [10, 5, 3, 2, 1, 1, 1]

            for (let i = 0; i < expectedNumberOfNodes.length; i++) {
                const numberOfNodes = await MerkleTreeNode.getNumberOfNodes(groupId, i)

                expect(numberOfNodes).toBe(expectedNumberOfNodes[i])
            }
        })
    })

    describe("previewNewRoot", () => {
        beforeEach(async () => {
            await clearDatabase()
        })

        it("Should not return the root hash if the group id does not exist", async () => {
            await seedZeroHashes(false)

            const fun = (): Promise<string> => previewNewRoot("WRONG_GROUP_ID", idCommitment)

            await expect(fun).rejects.toThrow()
        })

        it("Should not calculate the root hash without first creating the zero hashes", async () => {
            const fun = (): Promise<string> => previewNewRoot(groupId, idCommitment)

            await expect(fun).rejects.toThrow()
        })

        it("Should return the right root hash", async () => {
            await seedZeroHashes(false)

            for (let i = 0; i < 10; i++) {
                const idCommitment = poseidon([BigInt(i)]).toString()

                const expectedRootHash = await previewNewRoot(groupId, idCommitment)
                const rootHash = await appendLeaf(groupId, idCommitment)

                expect(rootHash).toBe(expectedRootHash)
            }
        })
    })

    describe("retrievePath", () => {
        beforeEach(async () => {
            await clearDatabase()
        })

        it(`Should not return any path if the identity commitment does not exist`, async () => {
            const fun = (): Promise<string[]> => retrievePath(groupId, idCommitment)

            await expect(fun).rejects.toThrow()
        })

        it(`Should return a path of ${config.MERKLE_TREE_LEVELS} hashes`, async () => {
            await seedZeroHashes(false)

            const idCommitments = []

            for (let i = 0; i < 10; i++) {
                idCommitments.push(poseidon([BigInt(i)]).toString())

                await appendLeaf(groupId, idCommitments[i])
            }

            const path = await retrievePath(groupId, idCommitments[5])

            expect(path.pathElements).toHaveLength(config.MERKLE_TREE_LEVELS)
            expect(path.indices).toHaveLength(config.MERKLE_TREE_LEVELS)
        })

        it("Should match the path obtained with the 'incrementalquintree' library", async () => {
            await seedZeroHashes(false)

            const tree = new IncrementalQuinTree(config.MERKLE_TREE_LEVELS, 0, 2, (inputs: BigInt[]) =>
                poseidon(inputs)
            )
            const idCommitments = []

            for (let i = 0; i < 10; i++) {
                idCommitments.push(poseidon([BigInt(i)]).toString())

                await appendLeaf(groupId, idCommitments[i])
                tree.insert(BigInt(idCommitments[i]))
            }

            const path1 = await retrievePath(groupId, idCommitments[5])

            const path2 = tree.genMerklePath(5)
            const path2Elements = path2.pathElements.map((e: BigInt[]) => e[0].toString())

            expect(path1.indices).toStrictEqual(path2.indices)
            expect(path1.pathElements).toStrictEqual(path2Elements)
        })
    })
})
