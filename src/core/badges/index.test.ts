import { OAuthAccount, OAuthAccountDocument, Token, TokenDocument, TokenStatus } from "@interrep/db"
import { Wallet } from "ethers"
import { createTokenMock } from "src/mocks"
import createOAuthAccountMock from "src/mocks/createOAuthAccountMock"
import _createWalletMock from "src/mocks/createWalletMock"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import { safeMint } from "../contracts/ReputationBadge"
import exists from "../contracts/ReputationBadge/exists"
import checkUserSignature from "./checkUserSignature"
import createUserMessage from "./createUserMessage"
import linkAccounts from "./linkAccounts"
import mintToken from "./mintToken"
import unlinkAccounts from "./unlinkAccounts"
import updateTokenStatus from "./updateTokenStatus"

const createWalletMock = () => _createWalletMock()
const existsMock = exists as jest.MockedFunction<typeof exists>

jest.mock("src/utils/backend/getSigner", () => ({
    __esModule: true,
    default: jest.fn(createWalletMock)
}))

jest.mock("src/core/contracts/ReputationBadge/exists", () => ({
    __esModule: true,
    default: jest.fn()
}))

jest.mock("src/core/contracts/ReputationBadge/safeMint", () => ({
    __esModule: true,
    default: jest.fn(() => ({
        transactionHash: "0x11",
        blockNumber: 5
    }))
}))

jest.mock("src/utils/common/crypto/encryptMessage", () => ({
    encryptMessageWithSalt: jest.fn(() => "encryptedMessage")
}))

describe("# core/badges", () => {
    const wallet = createWalletMock()

    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    describe("# updateTokenStatus", () => {
        let token: TokenDocument

        beforeAll(async () => {
            token = await Token.create(createTokenMock({ status: TokenStatus.MINTED }))
        })

        afterAll(async () => {
            await clearDatabase()
        })

        it("Should not update the status of a minted token if it has not been burned", async () => {
            existsMock.mockImplementationOnce(() => Promise.resolve(true))

            await updateTokenStatus([token])

            const newToken = await Token.findOne({ tokenId: "1" })

            expect(newToken).not.toBeUndefined()
            expect(newToken?.status).toBe(TokenStatus.MINTED)
        })

        it("Should update the status of a burned token", async () => {
            existsMock.mockImplementationOnce(() => Promise.resolve(false))

            await updateTokenStatus([token])

            const newToken = await Token.findOne({ tokenId: "1" })

            expect(newToken).not.toBeUndefined()
            expect(newToken?.status).toBe(TokenStatus.BURNED)
        })
    })

    describe("# mintToken", () => {
        let token: TokenDocument

        beforeAll(async () => {
            token = await Token.create(createTokenMock())
        })

        afterAll(async () => {
            await clearDatabase()
        })

        it("Should call  with the right arguments and update the token status", async () => {
            await mintToken(token)

            expect(safeMint).toHaveBeenCalledWith(token.userAddress, token.tokenId, token.provider)

            const newToken = await Token.findOne({ tokenId: "1" })

            expect(newToken).not.toBeUndefined()
            expect(newToken?.status).toBe(TokenStatus.MINTED)
            expect(newToken?.transaction).toBeDefined()
        })

        it("Should only mint a token with an undefined status", async () => {
            const fun = () => mintToken(token)

            await expect(fun).rejects.toThrow("You cannot mint a token with status MINTED")
        })
    })

    describe("# createUserMessage", () => {
        it("Should return true if the signer matches", () => {
            const expectedValue = createUserMessage(wallet.address, "608c4a10c994a377e232df7f")

            expect(typeof expectedValue).toBe("string")
        })
    })

    describe("# checkUserSignature", () => {
        it("Should return false if the signer does not match the given address and params", async () => {
            const expectedValue = checkUserSignature(
                wallet.address,
                "accountId",
                "0x5d4b2a66a5cfa29c4f36c27f7dbff1aee6ee2ae64a7367f73757439cd8016ceb4d2c389e281d15000ba3a75dd8e0c75aa78aa7dd91d32798ed017d62cbc8d4db1c"
            )

            expect(expectedValue).toBe(false)
        })

        it("Should return true if the signer matches", () => {
            const expectedValue = checkUserSignature(
                wallet.address,
                "608c4a10c994a377e232df7f",
                "0x5d4b2a66a5cfa29c4f36c27f7dbff1aee6ee2ae64a7367f73757439cd8016ceb4d2c389e281d15000ba3a75dd8e0c75aa78aa7dd91d32798ed017d62cbc8d4db1c"
            )

            expect(expectedValue).toBe(true)
        })
    })

    describe("# linkAccounts", () => {
        const wallet = Wallet.createRandom()
        let account: OAuthAccountDocument

        beforeAll(async () => {
            account = await OAuthAccount.create(createOAuthAccountMock())
        })

        afterAll(async () => {
            await clearDatabase()
        })

        it("Should link two Web2/Web3 accounts correctly", async () => {
            const token = await linkAccounts(account, wallet.address, wallet.publicKey)

            expect(account.isLinkedToAddress).toBe(true)
            expect(token).not.toBeUndefined()
            expect(token.encryptedAttestation).toBe("encryptedMessage")
        })
    })

    describe("# unlinkAccounts", () => {
        let account: OAuthAccountDocument
        let token: TokenDocument

        beforeAll(async () => {
            account = await OAuthAccount.create(createOAuthAccountMock({ isLinkedToAddress: true }))
            token = await Token.create(createTokenMock({ status: TokenStatus.BURNED }))
        })

        afterAll(async () => {
            await clearDatabase()
        })

        it("Should unlink two Web2/Web3 accounts correctly", async () => {
            await unlinkAccounts(account, token)

            expect(account.isLinkedToAddress).toBe(false)
        })
    })
})
