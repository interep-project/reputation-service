import { Token, TokenDocument, TokenStatus } from "@interrep/db"
import mintNewToken from "src/core/contracts/ReputationBadge/mintNewToken"
import createMockTokenObject from "src/mocks/createMockToken"
import { connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import mintToken from "./mintToken"

jest.mock("src/core/contracts/ReputationBadge/mintNewToken", () => ({
    __esModule: true,
    default: jest.fn(() => ({
        transactionHash: "hash",
        blockNumber: 123
    }))
}))

describe("mintToken", () => {
    let token: TokenDocument

    beforeAll(async () => {
        await connectDatabase()

        token = await Token.create(createMockTokenObject())
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    it("Should only mint a token with a status of NOT_MINTED", async () => {
        const fun = () => mintToken(token.id)

        await expect(fun).rejects.toThrow("Can't mint a token with status MINT_PENDING")
    })

    it("Should call mintNewToken with the right arguments and update the token status", async () => {
        await mintToken(token.id)

        expect(mintNewToken).toHaveBeenCalledWith(token.provider, token.userAddress, token.tokenId)

        const { status } = (await Token.findById(token.id)) as TokenDocument

        expect(status).toBe(TokenStatus.MINTED)
    })
})
