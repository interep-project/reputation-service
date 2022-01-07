import { OAuthProvider, ReputationLevel } from "@interrep/reputation"
import { appendLeaf } from "src/core/groups/mts"
import createNextMocks from "src/mocks/createNextMocks"
import {
    connectDatabase,
    clearTestingDatabase,
    connectTestingDatabase,
    disconnectTestingDatabase
} from "src/utils/backend/database"
import { seedZeroHashes } from "src/utils/backend/seeding"
import getLeavesController from "./getLeaves"
import hasLeafController from "./hasLeaf"
import getRootBatchController from "./getRootBatch"
import getRootBatchesController from "./getRootBatches"

jest.mock("src/utils/backend/database/database", () => ({
    __esModule: true,
    connectDatabase: jest.fn()
}))

describe("# controllers/trees", () => {
    beforeAll(async () => {
        await connectTestingDatabase()
    })

    afterAll(async () => {
        await disconnectTestingDatabase()
    })

    afterEach(async () => {
        await clearTestingDatabase()
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

            ;(connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await getLeavesController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return the leaves of an existing tree", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { rootHash: "14609760376212188739174515935152741473834465719479776351628428906066285698800" }
            })

            await seedZeroHashes()
            await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")

            await getLeavesController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toContain("111")
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

            ;(connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await hasLeafController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return false if a leaf does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: {
                    rootHash: "14609760376212188739174515935152741473834465719479776351628428906066285698800",
                    leafHash: "222"
                }
            })

            await seedZeroHashes()
            await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")

            await hasLeafController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toBeFalsy()
        })

        it("Should return true if a leaf exists", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: {
                    rootHash: "14609760376212188739174515935152741473834465719479776351628428906066285698800",
                    leafHash: "111"
                }
            })

            await seedZeroHashes()
            await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")

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

            ;(connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await getRootBatchController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return a root batch if it exists", async () => {
            const rootHash = "14609760376212188739174515935152741473834465719479776351628428906066285698800"
            const { req, res } = createNextMocks({
                method: "GET",
                query: {
                    rootHash
                }
            })

            await seedZeroHashes()
            await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")

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

            ;(connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await getRootBatchesController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return a list of root batches", async () => {
            const rootHash = "14609760376212188739174515935152741473834465719479776351628428906066285698800"
            const { req, res } = createNextMocks({
                method: "GET"
            })

            await seedZeroHashes()
            await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")

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
