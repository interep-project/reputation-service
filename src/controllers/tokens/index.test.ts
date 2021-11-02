import checkAndUpdateTokenStatus from "src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus"
import mintToken from "src/core/linking/mintToken"
import createMockTokenObject from "src/mocks/createMockToken"
import createNextMocks from "src/mocks/createNextMocks"
import { Token } from "@interrep/db"
import logger from "src/utils/backend/logger"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import { getTokensByAddressController, mintTokenController } from "."

jest.mock("src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus", () => ({
    __esModule: true,
    default: jest.fn()
}))

jest.mock("src/utils/backend/logger", () => ({
    __esModule: true,
    default: {
        error: jest.fn()
    }
}))

jest.mock("src/core/linking/mintToken", () => ({
    __esModule: true,
    default: jest.fn()
}))

describe("TokenController", () => {
    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    describe("getTokensByAddress", () => {
        beforeEach(async () => {
            await clearDatabase()
        })

        it("should return a 400 if there is no user address in query", async () => {
            // Given
            const { req, res } = createNextMocks({
                query: { userAddress: 123 },
                method: "GET"
            })

            // When
            await getTokensByAddressController(req, res)

            // Expect
            expect(res._getStatusCode()).toBe(400)
        })

        it("should return a 400 if the address in query is not valid", async () => {
            // Given
            const { req, res } = createNextMocks({
                query: { userAddress: "0x123" },
                method: "GET"
            })

            // When
            await getTokensByAddressController(req, res)

            // Expect
            expect(res._getStatusCode()).toBe(400)
            expect(res._getData()).toEqual("Invalid address")
        })

        it("should return an empty array if there is no tokens for that address", async () => {
            // Given
            const { req, res } = createNextMocks({
                query: { userAddress: "0xddfAbCdc4D8FfC6d5beaf154f18B778f892A0740" },
                method: "GET"
            })

            // When
            await getTokensByAddressController(req, res)

            // Expect
            expect(res._getStatusCode()).toBe(200)
            expect(res._getData().data).toEqual([])
        })

        it("should update and return found tokens", async () => {
            const userAddress = "0xddfAbCdc4D8FfC6d5beaf154f18B778f892A0740"

            const tokenMock = await Token.create(
                createMockTokenObject({
                    userAddress
                })
            )

            const { req, res } = createNextMocks({
                query: { userAddress },
                method: "GET"
            })

            await getTokensByAddressController(req, res)

            expect(checkAndUpdateTokenStatus).toHaveBeenCalled()
            expect(res._getStatusCode()).toBe(200)
            expect(res._getData().data).toEqual([tokenMock.toJSON()])
        })

        it("should return 500 and log the error", async () => {
            const err = new Error("Error updating tokens")
            // @ts-expect-error: mocked above
            checkAndUpdateTokenStatus.mockImplementationOnce(() => {
                throw err
            })

            const userAddress = "0xddfAbCdc4D8FfC6d5beaf154f18B778f892A0740"

            await Token.create(
                createMockTokenObject({
                    userAddress
                })
            )

            const { req, res } = createNextMocks({
                query: { userAddress },
                method: "GET"
            })

            await getTokensByAddressController(req, res)

            expect(res._getStatusCode()).toBe(500)
            expect(logger.error).toHaveBeenCalledWith(err)
        })
    })

    describe("mintToken", () => {
        it("should return a 400 if not token id was passed", async () => {
            const { req, res } = createNextMocks({
                query: {},
                method: "POST"
            })

            await mintTokenController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("should call mintToken with tokenId and return the tx response", async () => {
            const txResponseMock = { hash: "hash" }
            // @ts-expect-error: mocked above
            mintToken.mockImplementationOnce(() => txResponseMock)

            const tokenId = "0xaaaaa"
            const { req, res } = createNextMocks({
                query: { tokenId },
                method: "POST"
            })

            await mintTokenController(req, res)

            expect(mintToken).toHaveBeenCalledWith(tokenId)
            expect(res._getStatusCode()).toBe(200)
            expect(res._getData().data).toEqual(txResponseMock)
        })

        it("should return 500 and send the error", async () => {
            const err = new Error("Invalid operation")
            // @ts-expect-error: mocked above
            mintToken.mockImplementationOnce(() => {
                throw err
            })

            const tokenId = "0xaaaaa"
            const { req, res } = createNextMocks({
                query: { tokenId },
                method: "POST"
            })

            await mintTokenController(req, res)

            expect(res._getStatusCode()).toBe(500)
            expect(res._getData()).toEqual(err)
            expect(logger.error).toHaveBeenCalledWith(err)
        })
    })
})
