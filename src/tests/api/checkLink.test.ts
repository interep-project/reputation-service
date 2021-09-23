import { Web2Provider } from "@interrep/reputation-criteria"
import { getSession } from "next-auth/client"
import createNextMocks from "src/mocks/createNextMocks"
import mockSession from "src/mocks/session"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import handler from "src/pages/api/linking/check"
import { clearDatabase, connect, dropDatabaseAndDisconnect } from "src/utils/server/testDatabase"

jest.mock("next-auth/client", () => ({
    getSession: jest.fn()
}))

const getSessionMocked = getSession as jest.MockedFunction<typeof getSession>

describe("api/linking/checkLink", () => {
    beforeAll(async () => {
        await connect()
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

        it("should return a 500 if a web 2 account can't be found from the session", async () => {
            const { req, res } = createNextMocks({
                method: "GET"
            })

            // When
            await handler(req, res)

            // Expect
            expect(res._getStatusCode()).toBe(500)
            expect(res._getData()).toEqual("Can't find web 2 account")
        })

        it("should return true if an account is already linked", async () => {
            const isLinkedToAddress = true
            const web2Account = await Web2Account.create({
                provider: Web2Provider.TWITTER,
                uniqueKey: `${Web2Provider.TWITTER}:1`,
                createdAt: Date.now(),
                providerAccountId: "1",
                isLinkedToAddress,
                basicReputation: undefined
            })

            getSessionMocked.mockImplementationOnce(() =>
                Promise.resolve({ ...mockSession, web2AccountId: web2Account.id })
            )

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
            expect(res._getData()).toEqual("Error while verifying if web 2 account is linked")
        })
    })
})
