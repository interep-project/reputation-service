import { OAuthProvider, ReputationLevel } from "@interrep/reputation"
import { appendLeaf } from "src/core/groups/mts"
import createNextMocks from "src/mocks/createNextMocks"
import { clearDatabase, connectDatabase, disconnectDatabase } from "src/utils/backend/testingDatabase"
import { connectDatabase as _connectDatabase } from "src/utils/backend/database"
import { seedZeroHashes } from "src/utils/backend/seeding"
import getLeavesController from "./getLeaves"
import hasLeafController from "./hasLeaf"
import getRootBatchController from "./getRootBatch"
import getRootBatchesController from "./getRootBatches"

jest.mock("src/utils/backend/database", () => ({
    __esModule: true,
    connectDatabase: jest.fn()
}))

describe("# controllers/trees", () => {
    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    afterEach(async () => {
        await clearDatabase()
    })

    describe("# getLeaves", () => {
        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "POST"
            })

            await getLeavesController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if there are not the right parameters", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: {}
            })

            await getLeavesController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the root hash does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { rootHash: "111" }
            })

            await getLeavesController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { rootHash: "111" }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await getLeavesController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return the leaves of an existing tree", async () => {
            await seedZeroHashes()
            const rootHash = await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")
            const { req, res } = createNextMocks({
                method: "GET",
                query: { rootHash }
            })

            await getLeavesController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toContain("111")
        })

        it("Should return the leaves of an existing tree with limit and offset", async () => {
            await seedZeroHashes()
            await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")
            await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "222")
            const rootHash = await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "333")
            const { req, res } = createNextMocks({
                method: "GET",
                query: { rootHash, limit: "1", offset: "1" }
            })

            await getLeavesController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toHaveLength(1)
            expect(data).toContain("222")
        })
    })

    describe("# hasLeaf", () => {
        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "POST"
            })

            await hasLeafController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if there are not the right parameters", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: {}
            })

            await hasLeafController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the root hash does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { rootHash: "111", leafHash: "111" }
            })

            await hasLeafController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { rootHash: "111", leafHash: "111" }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await hasLeafController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return false if a leaf does not exist", async () => {
            await seedZeroHashes()
            const rootHash = await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")
            const { req, res } = createNextMocks({
                method: "GET",
                query: {
                    rootHash,
                    leafHash: "222"
                }
            })

            await hasLeafController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toBeFalsy()
        })

        it("Should return true if a leaf exists", async () => {
            await seedZeroHashes()
            const rootHash = await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")
            const { req, res } = createNextMocks({
                method: "GET",
                query: {
                    rootHash,
                    leafHash: "111"
                }
            })

            await hasLeafController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toBeTruthy()
        })
    })

    describe("# getRootBatch", () => {
        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "POST"
            })

            await getRootBatchController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if there are not the right parameters", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: {}
            })

            await getRootBatchController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the root batch does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { rootHash: "111" }
            })

            await getRootBatchController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { rootHash: "111" }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await getRootBatchController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return a root batch if it exists", async () => {
            await seedZeroHashes()
            const rootHash = await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")
            const { req, res } = createNextMocks({
                method: "GET",
                query: {
                    rootHash
                }
            })

            await getRootBatchController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toEqual({
                group: {
                    name: ReputationLevel.GOLD,
                    provider: OAuthProvider.TWITTER
                },
                rootHashes: [rootHash]
            })
        })
    })

    describe("# getRootBatches", () => {
        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "POST"
            })

            await getRootBatchesController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { rootHash: "111" }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await getRootBatchesController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return a list of root batches", async () => {
            await seedZeroHashes()
            const rootHash = await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")
            const { req, res } = createNextMocks({
                method: "GET"
            })

            await getRootBatchesController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toContainEqual({
                group: {
                    name: ReputationLevel.GOLD,
                    provider: OAuthProvider.TWITTER
                },
                rootHashes: [rootHash]
            })
        })
    })
})
