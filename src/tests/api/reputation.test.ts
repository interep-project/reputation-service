import getReputation from "src/pages/api/reputation/[provider]/[username]"
import { clearDatabase, connect, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import createNextMocks from "src/mocks/createNextMocks"
import { ReputationLevel, OAuthProvider } from "@interrep/reputation-criteria"

jest.mock("src/core/reputation/twitter", () => ({
    getTwitterParametersByUsername: jest.fn(() => ({
        followers: 100,
        verifiedProfile: true,
        botometerOverallScore: 2
    }))
}))

describe("Reputation APIs", () => {
    beforeAll(async () => {
        await connect()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    afterEach(async () => {
        await clearDatabase()
    })

    describe("Get user reputation", () => {
        it("Should return a 405 if the method is not GET", async () => {
            const { req, res } = createNextMocks({
                query: {},
                method: "PUT"
            })

            await getReputation(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return a 400 if some query parameter is missing", async () => {
            const { req, res } = createNextMocks({
                query: {},
                method: "GET"
            })

            await getReputation(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return the user reputation", async () => {
            const provider = OAuthProvider.TWITTER
            const username = "username"

            const { req, res } = createNextMocks({
                query: { provider, username }
            })

            await getReputation(req, res)

            expect(res._getData().data.reputation).toBe(ReputationLevel.GOLD)
        })
    })
})
