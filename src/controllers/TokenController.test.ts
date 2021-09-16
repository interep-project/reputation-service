import checkAndUpdateTokenStatus from "src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus"
import TwitterBadgeContract from "src/core/blockchain/ReputationBadge/TwitterBadgeContract"
import mintToken from "src/core/linking/mintToken"
import createMockTokenObject from "src/mocks/createMockToken"
import createNextMocks from "src/mocks/createNextMocks"
import Token from "src/models/tokens/Token.model"
import { DeployedContracts, getDeployedContractAddress } from "src/utils/crypto/deployedContracts"
import logger from "src/utils/server/logger"
import { clearDatabase, connect, dropDatabaseAndDisconnect } from "src/utils/server/testDatabase"
import TokenController from "./TokenController"

jest.mock("src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus", () => ({
    __esModule: true,
    default: jest.fn()
}))

jest.mock("src/utils/server/logger", () => ({
    __esModule: true,
    default: {
        error: jest.fn()
    }
}))

jest.mock("src/core/linking/mintToken", () => ({
    __esModule: true,
    default: jest.fn()
}))

jest.mock("src/core/blockchain/ReputationBadge/TwitterBadgeContract", () => ({
    __esModule: true,
    default: {
        exists: jest.fn()
    }
}))

describe("TokenController", () => {
    beforeAll(async () => {
        await connect()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    describe("getTokensByAddress", () => {
        beforeEach(async () => {
            await clearDatabase()
        })

        it("should return a 400 if there is no owner string in query", async () => {
            // Given
            const { req, res } = createNextMocks({
                query: { owner: 123 },
                method: "GET"
            })

            // When
            await TokenController.getTokensByAddress(req, res)

            // Expect
            expect(res._getStatusCode()).toBe(400)
        })

        it("should return a 400 if the address in query is not valid", async () => {
            // Given
            const { req, res } = createNextMocks({
                query: { owner: "0x123" },
                method: "GET"
            })

            // When
            await TokenController.getTokensByAddress(req, res)

            // Expect
            expect(res._getStatusCode()).toBe(400)
            expect(res._getData()).toEqual("Invalid address")
        })

        it("should return an empty array if there is no tokens for that address", async () => {
            // Given
            const { req, res } = createNextMocks({
                query: { owner: "0xddfAbCdc4D8FfC6d5beaf154f18B778f892A0740" },
                method: "GET"
            })

            // When
            await TokenController.getTokensByAddress(req, res)

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
                query: { owner: userAddress },
                method: "GET"
            })

            await TokenController.getTokensByAddress(req, res)

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
                query: { owner: userAddress },
                method: "GET"
            })

            await TokenController.getTokensByAddress(req, res)

            expect(res._getStatusCode()).toBe(500)
            expect(logger.error).toHaveBeenCalledWith(err)
        })
    })

    describe("getTokenByContractAndId", () => {
        it("should return a 400 if the contract address is unknown", async () => {
            const { req, res } = createNextMocks({
                query: {
                    contractAddress: "0x00000000009d2D9a65F0992F2272dE9f3c7fa6e0",
                    id: "1234"
                },
                method: "GET"
            })

            await TokenController.getTokenByContractAndId(req, res)

            expect(res._getStatusCode()).toBe(400)
            expect(res._getData()).toEqual("Invalid contract address")
        })

        it("should return a 400 if some parameters are missing", async () => {
            const { req, res } = createNextMocks({
                query: {
                    contractAddress: "0x00000000009d2D9a65F0992F2272dE9f3c7fa6e0",
                    id: undefined
                },
                method: "GET"
            })

            await TokenController.getTokenByContractAndId(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("should handle if the token is does not match an existing one", async () => {
            // @ts-ignore: mocked above
            TwitterBadgeContract.exists.mockImplementationOnce(() => false)

            const tokenId = "1295732629607720579320"
            const { req, res } = createNextMocks({
                query: {
                    contractAddress: getDeployedContractAddress(DeployedContracts.TWITTER_BADGE),
                    id: tokenId
                },
                method: "GET"
            })

            await TokenController.getTokenByContractAndId(req, res)

            expect(res._getStatusCode()).toBe(400)
            expect(res._getData()).toEqual(`Token with id ${tokenId} does not exist`)
        })

        it("should return the token metadata", async () => {
            // @ts-ignore: mocked above
            TwitterBadgeContract.exists.mockImplementationOnce(() => true)

            const { req, res } = createNextMocks({
                query: {
                    contractAddress: getDeployedContractAddress(DeployedContracts.TWITTER_BADGE),
                    id: "1234"
                },
                method: "GET"
            })

            await TokenController.getTokenByContractAndId(req, res)

            expect(res._getStatusCode()).toBe(200)
            expect(res._getData().data).toEqual({
                description: "InterRep reputation badge for a Twitter account.",
                image: "",
                name: "InterRep Twitter Reputation Badge"
            })
        })

        it("should return 500 and log an error", async () => {
            const err = new Error("Invalid operation")
            // @ts-ignore: mocked above
            TwitterBadgeContract.exists.mockImplementationOnce(() => {
                throw err
            })

            const { req, res } = createNextMocks({
                query: {
                    contractAddress: getDeployedContractAddress(DeployedContracts.TWITTER_BADGE),
                    id: "1234"
                },
                method: "GET"
            })

            await TokenController.getTokenByContractAndId(req, res)

            expect(res._getStatusCode()).toBe(500)
            expect(logger.error).toHaveBeenCalledWith(err)
        })
    })

    describe("mintToken", () => {
        it("should return a 400 if not token id was passed", async () => {
            const { req, res } = createNextMocks({
                body: {},
                method: "PUT"
            })

            await TokenController.mintToken(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("should call mintToken with tokenId and return the tx response", async () => {
            const txResponseMock = { hash: "hash" }
            // @ts-expect-error: mocked above
            mintToken.mockImplementationOnce(() => txResponseMock)

            const tokenId = "0xaaaaa"
            const { req, res } = createNextMocks({
                body: { tokenId },
                method: "PUT"
            })

            await TokenController.mintToken(req, res)

            expect(mintToken).toHaveBeenCalledWith(tokenId)
            expect(res._getStatusCode()).toBe(200)
            expect(res._getData().data).toEqual(txResponseMock)
        })

        it("should return 400 and send the error", async () => {
            const err = new Error("Invalid operation")
            // @ts-expect-error: mocked above
            mintToken.mockImplementationOnce(() => {
                throw err
            })

            const tokenId = "0xaaaaa"
            const { req, res } = createNextMocks({
                body: { tokenId },
                method: "PUT"
            })

            await TokenController.mintToken(req, res)

            expect(res._getStatusCode()).toBe(400)
            expect(res._getData()).toEqual(err)
            expect(logger.error).toHaveBeenCalledWith(err)
        })
    })
})
