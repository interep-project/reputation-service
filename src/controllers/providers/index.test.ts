import { OAuthProvider, ReputationLevel } from "@interep/reputation"
import { appendLeaf } from "src/core/groups/mts"
import createNextMocks from "src/mocks/createNextMocks"
import { clearDatabase, connectDatabase, disconnectDatabase } from "src/utils/backend/testingDatabase"
import { connectDatabase as _connectDatabase } from "src/utils/backend/database"
import { seedZeroHashes } from "src/utils/backend/seeding"
import getProvidersController from "./getProviders"
import hasIdentityCommitmentController from "./hasIdentityCommitment"

jest.mock("src/utils/backend/database", () => ({
    __esModule: true,
    connectDatabase: jest.fn()
}))

describe("# controllers/providers", () => {
    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    afterEach(async () => {
        await clearDatabase()
    })

    describe("# getProviders", () => {
        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "POST"
            })

            await getProvidersController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET"
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await getProvidersController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return all the supported providers", async () => {
            const { req, res } = createNextMocks({
                method: "GET"
            })

            await getProvidersController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toContain("twitter")
        })
    })

    describe("# hasIdentityCommitment", () => {
        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "POST"
            })

            await hasIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if there are not the right parameters", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: {}
            })

            await hasIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 400 if the provider does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider: "a", identityCommitment: "111" }
            })

            await hasIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider: OAuthProvider.TWITTER, identityCommitment: "111" }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await hasIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return false if the identity commitment does not exist in any provider group", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: {
                    provider: OAuthProvider.TWITTER,
                    identityCommitment: "111"
                }
            })

            await seedZeroHashes()

            await hasIdentityCommitmentController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toBeFalsy()
        })

        it("Should return true if a provider group has the identity commitment", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: {
                    provider: OAuthProvider.TWITTER,
                    identityCommitment: "111"
                }
            })

            await seedZeroHashes()
            await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, "111")

            await hasIdentityCommitmentController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toBeTruthy()
        })
    })
})
