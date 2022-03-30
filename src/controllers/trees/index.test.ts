import { OAuthProvider, ReputationLevel } from "@interep/reputation"
import { appendLeaf } from "src/core/groups/mts"
import createNextMocks from "src/mocks/createNextMocks"
import { clearDatabase, connectDatabase, disconnectDatabase } from "src/utils/backend/testingDatabase"
import { connectDatabase as _connectDatabase } from "src/utils/backend/database"
import { seedZeroHashes } from "src/utils/backend/seeding"
import getLeavesController from "./getLeaves"
import hasLeafController from "./hasLeaf"

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
                query: { root: "111" }
            })

            await getLeavesController(req, res)

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

            await getLeavesController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return the leaves of an existing tree", async () => {
            await seedZeroHashes()
            const root = await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")
            const { req, res } = createNextMocks({
                method: "GET",
                query: { root }
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
            const root = await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "333")
            const { req, res } = createNextMocks({
                method: "GET",
                query: { root, limit: "1", offset: "1" }
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
                query: { root: "111", leaf: "111" }
            })

            await hasLeafController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { root: "111", leaf: "111" }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await hasLeafController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return false if a leaf does not exist", async () => {
            await seedZeroHashes()
            const root = await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")
            const { req, res } = createNextMocks({
                method: "GET",
                query: {
                    root,
                    leaf: "222"
                }
            })

            await hasLeafController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toBeFalsy()
        })

        it("Should return true if a leaf exists", async () => {
            await seedZeroHashes()
            const root = await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")
            const { req, res } = createNextMocks({
                method: "GET",
                query: {
                    root,
                    leaf: "111"
                }
            })

            await hasLeafController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toBeTruthy()
        })
    })
})
