import checkAndUpdateTokenStatus from "src/core/contracts/ReputationBadge/checkAndUpdateTokenStatus"
import mintNewToken from "src/core/contracts/ReputationBadge/mintNewToken"
import createMockTokenObject from "src/mocks/createMockToken"
import { TokenDocument, TokenStatus, Token } from "@interrep/db"
import { connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import mintToken from "./mintToken"

const mockTxResponse = {
    hash: "hash",
    blockNumber: 123,
    chainId: 888,
    timestamp: 121212
}
jest.mock("src/core/contracts/ReputationBadge/mintNewToken", () => ({
    __esModule: true,
    default: jest.fn(() => mockTxResponse)
}))

jest.mock("src/core/contracts/ReputationBadge/checkAndUpdateTokenStatus", () => ({
    __esModule: true,
    default: jest.fn()
}))

const checkAndUpdateTokenStatusMocked = checkAndUpdateTokenStatus as jest.MockedFunction<
    typeof checkAndUpdateTokenStatus
>

describe("mintToken", () => {
    let mockToken: TokenDocument

    beforeAll(async () => {
        await connectDatabase()
        mockToken = await Token.create(createMockTokenObject())
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    it("should throw if token is not found", async () => {
        await expect(() => mintToken("60b12200d5053f71362feed0")).rejects.toThrow(
            "token with id 60b12200d5053f71362feed0 not found"
        )
    })

    it("should only mint a token with a status of NOT_MINTED", async () => {
        checkAndUpdateTokenStatusMocked.mockImplementationOnce((tokens) => {
            tokens[0].status = TokenStatus.MINT_PENDING
            tokens[0].save()

            return Promise.resolve(null)
        })

        const fun = () => mintToken(mockToken.id)

        await expect(fun).rejects.toThrow("Can't mint a token with status MINT_PENDING")
    })

    it("should call mintNewToken with the right arguments and update the token status", async () => {
        const txResponse = await mintToken(mockToken.id)

        expect(mintNewToken).toHaveBeenCalledWith({
            badgeAddress: mockToken.contractAddress,
            to: mockToken.userAddress,
            tokenId: mockToken.decimalId
        })

        const tken = await Token.findById(mockToken.id)

        expect(tken!.status).toBe(TokenStatus.MINT_PENDING)

        expect(txResponse).toEqual(mockTxResponse)
    })
})
