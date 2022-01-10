import { Token } from "@interrep/db"
import { updateTokenStatus } from "src/core/badges"
import { createTokenMock } from "src/mocks"
import createNextMocks from "src/mocks/createNextMocks"
import { clearTestingDatabase, connectTestingDatabase, disconnectTestingDatabase } from "src/utils/backend/database"
import { getTokensByAddressController, mintTokenController } from "."

jest.mock("src/core/badges/updateTokenStatus", () => ({
    __esModule: true,
    default: jest.fn()
}))

jest.mock("src/core/badges/mintToken", () => ({
    __esModule: true,
    default: jest.fn()
}))

describe("# controller/badges", () => {
    beforeAll(async () => {
        await connectTestingDatabase()
    })

    afterAll(async () => {
        await disconnectTestingDatabase()
    })

    describe("# getTokensByAddress", () => {
        beforeEach(async () => {
            await clearTestingDatabase()
        })

        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "POST"
            })

            await getTokensByAddressController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if the user address is not defined", async () => {
            const { req, res } = createNextMocks({
                method: "GET"
            })

            await getTokensByAddressController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 400 if the user address is not valid", async () => {
            const { req, res } = createNextMocks({
                query: { userAddress: "0x123" },
                method: "GET"
            })

            await getTokensByAddressController(req, res)

            expect(res._getStatusCode()).toBe(400)
            expect(res._getData()).toEqual("The user address is not valid")
        })

        it("Should return an empty array if there are no tokens for a user address", async () => {
            const { req, res } = createNextMocks({
                query: { userAddress: "0xddfAbCdc4D8FfC6d5beaf154f18B778f892A0740" },
                method: "GET"
            })

            await getTokensByAddressController(req, res)

            expect(res._getStatusCode()).toBe(200)
            expect(res._getData().data).toEqual([])
        })

        it("Should update the token status and return and updated list", async () => {
            const userAddress = "0xddfAbCdc4D8FfC6d5beaf154f18B778f892A0740"
            const tokenMock = await Token.create(createTokenMock({ userAddress }))

            const { req, res } = createNextMocks({
                query: { userAddress },
                method: "GET"
            })

            await getTokensByAddressController(req, res)

            expect(updateTokenStatus).toHaveBeenCalled()
            expect(res._getStatusCode()).toBe(200)
            expect(res._getData().data[0].tokenId).toContainEqual(tokenMock.tokenId)
        })
    })

    describe("# mintToken", () => {
        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "GET"
            })

            await mintTokenController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if the token id is not defined", async () => {
            const { req, res } = createNextMocks({
                method: "POST"
            })

            await mintTokenController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })
    })
})
