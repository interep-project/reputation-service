import { OAuthProvider, ReputationLevel } from "@interep/reputation"
import { appendLeaf } from "src/core/groups/mts"
import createNextMocks from "src/mocks/createNextMocks"
import { clearDatabase, connectDatabase, disconnectDatabase } from "src/utils/backend/testingDatabase"
import { connectDatabase as _connectDatabase } from "src/utils/backend/database"
import { seedZeroHashes } from "src/utils/backend/seeding"
import getRootBatchController from "./getRootBatch"
import getRootBatchesController from "./getRootBatches"

jest.mock("src/utils/backend/database", () => ({
    __esModule: true,
    connectDatabase: jest.fn()
}))

describe("# controllers/batches", () => {
    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    afterEach(async () => {
        await clearDatabase()
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
                query: { root: "111" }
            })

            await getRootBatchController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { root: "111" }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await getRootBatchController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return a root batch if it exists", async () => {
            await seedZeroHashes()
            const root = await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")
            const { req, res } = createNextMocks({
                method: "GET",
                query: {
                    root
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
                roots: [root]
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
                query: { root: "111" }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await getRootBatchesController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return a list of root batches", async () => {
            await seedZeroHashes()
            const root = await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")
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
                roots: [root]
            })
        })
    })
})
