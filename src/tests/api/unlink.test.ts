import createNextMocks from "src/mocks/createNextMocks"
import jwt from "next-auth/jwt"
import handler from "src/pages/api/linking/unlink"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import unlinkAccounts from "src/core/linking/unlink"
import logger from "src/utils/backend/logger"

jest.mock("src/core/linking/unlink", () => jest.fn())
jest.mock("next-auth/jwt", () => ({
    getToken: jest.fn()
}))
jest.spyOn(logger, "error")

const getTokenMocked = jwt.getToken as jest.MockedFunction<typeof jwt.getToken>
const unlinkAccountsMocked = unlinkAccounts as jest.MockedFunction<typeof unlinkAccounts>

describe("api/linking/unlink", () => {
    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    beforeEach(async () => {
        await clearDatabase()
    })

    it("should return a 500 if there is an error getting the JWT", async () => {
        // Given
        getTokenMocked.mockImplementationOnce(() => Promise.reject(new Error()))

        const { req, res } = createNextMocks({
            method: "PUT"
        })

        // When
        await handler(req, res)

        // Expect
        expect(res._getStatusCode()).toBe(500)
    })

    it("should return a 403 if there is no ID in the JWT", async () => {
        // Given
        getTokenMocked.mockImplementationOnce(() => Promise.resolve(""))

        const { req, res } = createNextMocks({
            method: "PUT"
        })

        // When
        await handler(req, res)

        // Expect
        expect(res._getStatusCode()).toBe(403)
    })

    it("should call unlinkAccounts with the right parameters", async () => {
        const decryptedAttestation = "decrypted"
        const accountIdFromSession = "accountId"
        getTokenMocked.mockImplementationOnce(() =>
            // @ts-ignore: resolves to a JWT
            Promise.resolve({ accountId: accountIdFromSession })
        )

        const { req, res } = createNextMocks({
            method: "PUT",
            body: ({
                decryptedAttestation
            } as unknown) as Body
        })

        // When
        await handler(req, res)

        // Expect
        expect(unlinkAccountsMocked).toHaveBeenCalledWith({
            accountIdFromSession,
            decryptedAttestation
        })
    })

    describe("unlink", () => {
        const decryptedAttestation = "decryptedAttestation"
        const accountIdFromSession = "accountId"
        beforeAll(() => {
            getTokenMocked.mockImplementation(() =>
                // @ts-ignore: resolves to a JWT
                Promise.resolve({ accountId: accountIdFromSession })
            )
        })

        it("should send back result if it succeeded", async () => {
            const { req, res } = createNextMocks({
                method: "PUT",
                body: ({
                    decryptedAttestation
                } as unknown) as Body
            })

            // When
            await handler(req, res)

            // Expect
            expect(res._getStatusCode()).toBe(200)
        })

        it("should send back the result if it did not suceed", async () => {
            const errorMessage = "error"
            unlinkAccountsMocked.mockImplementationOnce(() => {
                throw new Error(errorMessage)
            })

            const { req, res } = createNextMocks({
                method: "PUT",
                body: ({
                    decryptedAttestation
                } as unknown) as Body
            })

            // When
            await handler(req, res)

            // Expect
            expect(res._getStatusCode()).toBe(500)
        })

        it("should catch an error", async () => {
            const mockError = new Error("fail")
            unlinkAccountsMocked.mockImplementationOnce(() => Promise.reject(mockError))

            const { req, res } = createNextMocks({
                method: "PUT",
                body: ({
                    decryptedAttestation
                } as unknown) as Body
            })

            // When
            await handler(req, res)

            // Expect
            expect(res._getStatusCode()).toBe(500)
            expect(logger.error).toHaveBeenCalledWith(mockError)
        })
    })
})
