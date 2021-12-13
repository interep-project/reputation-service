import { OAuthProvider } from "@interrep/reputation"
import { getSession } from "next-auth/client"
import createNextMocks from "src/mocks/createNextMocks"
import mockSession from "src/mocks/session"
import { OAuthAccount } from "@interrep/db"
import handler from "src/pages/api/linking/check"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"

jest.mock("next-auth/client", () => ({
    getSession: jest.fn()
}))

const getSessionMocked = getSession as jest.MockedFunction<typeof getSession>

describe("api/linking/checkLink", () => {
    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    beforeEach(async () => {
        await clearDatabase()
    })

    it("should return a 405 if method is not GET", async () => {
        // Given
        const { req, res } = createNextMocks({
            method: "PUT"
        })

        // When
        await handler(req, res)

        // Expect
        expect(res._getStatusCode()).toBe(405)
    })

    it("should not authorize a user without session", async () => {
        // Given
        getSessionMocked.mockImplementation(() => Promise.resolve(null))

        const { req, res } = createNextMocks({
            method: "GET"
        })

        // When
        await handler(req, res)

        // Expect
        expect(res._getStatusCode()).toBe(401)
    })

    describe("with Session", () => {
        beforeAll(() => {
            getSessionMocked.mockImplementation(() => Promise.resolve(mockSession))
        })

        it("should return a 500 if a account can't be found from the session", async () => {
            const { req, res } = createNextMocks({
                method: "GET"
            })

            // When
            await handler(req, res)

            // Expect
            expect(res._getStatusCode()).toBe(500)
            expect(res._getData()).toEqual("Can't find account")
        })

        it("should return true if an account is already linked", async () => {
            const isLinkedToAddress = true
            const account = await OAuthAccount.create({
                provider: OAuthProvider.TWITTER,
                uniqueKey: `${OAuthProvider.TWITTER}:1`,
                createdAt: Date.now(),
                providerAccountId: "1",
                isLinkedToAddress
            })

            getSessionMocked.mockImplementationOnce(() => Promise.resolve({ ...mockSession, accountId: account.id }))

            const { req, res } = createNextMocks({
                method: "GET"
            })

            // When
            await handler(req, res)

            // Expect
            expect(res._getStatusCode()).toBe(200)
            expect(res._getData().data).toEqual(isLinkedToAddress)
        })

        it("should return a 500 if there is an error", async () => {
            getSessionMocked.mockImplementationOnce(() => Promise.reject(new Error()))

            const { req, res } = createNextMocks({
                method: "GET"
            })

            // When
            await handler(req, res)

            // Expect
            expect(res._getStatusCode()).toBe(500)
            expect(res._getData()).toEqual("Error while verifying if account is linked")
        })
    })
})
