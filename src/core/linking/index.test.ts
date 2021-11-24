import { ContractTransaction } from "@ethersproject/contracts"
import { OAuthAccount, OAuthAccountDocument, Token } from "@interrep/db"
import { OAuthProvider, ReputationLevel } from "@interrep/reputation-criteria"
import { Wallet } from "ethers"
import { currentNetwork } from "src/config"
import linkAccounts from "src/core/linking"
import checkIfUserSignatureIsValid from "src/core/signing/checkIfUserSignatureIsValid"
import { connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import { encryptMessageWithSalt } from "src/utils/common/crypto"

const addy = "0x622c62E3be972ABdF172DA466d425Df4C93470E4"
const getParams = (override?: Record<string, unknown>) => ({
    chainId: currentNetwork.chainId,
    address: addy,
    userSignature: "signature",
    accountId: "608a89a5346f2f9008feef8e",
    userPublicKey: "pubKey",
    ...override
})

const createMockedSigner = () => Wallet.fromMnemonic("test test test test test test test test test test test junk")

jest.mock("src/utils/backend/getSigner", () => ({
    __esModule: true,
    default: jest.fn(() => createMockedSigner())
}))

jest.mock("ethers", () => {
    const actualEthers = jest.requireActual("ethers")
    return {
        ...actualEthers,
        ethers: {
            utils: {
                id: jest.fn(() => `0x03dd40b36474bf4559c4d733be6f5ec1e61bcb562d1c7f04629ee3af7ee569f9`),
                verifyMessage: jest.fn()
            }
        }
    }
})

jest.mock("src/core/signing/checkIfUserSignatureIsValid", () => ({
    __esModule: true,
    default: jest.fn()
}))

jest.mock("../blockchain/ReputationBadge/mintNewToken", () => ({
    __esModule: true,
    default: jest.fn(
        (): Partial<ContractTransaction> => ({
            hash: "hash",
            blockNumber: 5,
            chainId: 31337,
            timestamp: 1234
        })
    )
}))

jest.mock("src/utils/common/crypto/encryptMessage", () => ({
    encryptMessageWithSalt: jest.fn(() => "encryptedMessage")
}))

const checkIfUserSignatureIsValidMocked = checkIfUserSignatureIsValid as jest.MockedFunction<
    typeof checkIfUserSignatureIsValid
>

describe("linkAccounts", () => {
    checkIfUserSignatureIsValidMocked.mockImplementation(() => true)

    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    // afterEach(async () => {
    //   await clearDatabase();
    // });

    it("should throw if the address is invalid", async () => {
        const badAddy = "0x123"
        await expect(linkAccounts(getParams({ address: badAddy }))).rejects.toThrow(`Invalid address ${badAddy}`)
    })

    describe("signature", () => {
        it("should throw if the signature is invalid", async () => {
            checkIfUserSignatureIsValidMocked.mockImplementationOnce(() => false)
            await expect(linkAccounts(getParams({}))).rejects.toThrow()
        })
    })

    describe("OAuth account", () => {
        let account: OAuthAccountDocument

        beforeAll(async () => {
            account = await OAuthAccount.create({
                provider: OAuthProvider.TWITTER,
                uniqueKey: `${OAuthProvider.TWITTER}:1`,
                createdAt: Date.now(),
                providerAccountId: "1",
                isLinkedToAddress: true,
                reputation: ReputationLevel.NOT_SUFFICIENT
            })
        })

        it("should throw if it fails retrieving the account", async () => {
            await expect(() => linkAccounts(getParams({ accountId: "thisIdIsInvalid" }))).rejects.toThrow(
                `Error retrieving account`
            )
        })

        it("should throw if there is no account for that id", async () => {
            await expect(() => linkAccounts(getParams())).rejects.toThrow(`Account not found`)
        })

        it("should throw if the account is already linked", async () => {
            await expect(() => linkAccounts(getParams({ accountId: account.id }))).rejects.toThrow(
                `Account already linked`
            )
        })

        describe("link", () => {
            let accountNotLinked: OAuthAccountDocument
            beforeAll(async () => {
                accountNotLinked = await OAuthAccount.create({
                    provider: OAuthProvider.TWITTER,
                    uniqueKey: `${OAuthProvider.TWITTER}:2`,
                    createdAt: Date.now(),
                    providerAccountId: "2",
                    user: { id: "2", username: "new name" },
                    isLinkedToAddress: false,
                    reputation: ReputationLevel.NOT_SUFFICIENT
                })
            })

            it("should throw if the account's reputation is not GOLD", async () => {
                await expect(
                    linkAccounts({
                        accountId: accountNotLinked.id,
                        address: addy,
                        userSignature: "signature",
                        userPublicKey: "pubKey"
                    })
                ).rejects.toThrow(`Insufficient account's reputation`)
            })
        })
    })

    describe("Token creation", () => {
        let accountMock: OAuthAccountDocument

        beforeAll(async () => {
            accountMock = await OAuthAccount.create({
                provider: OAuthProvider.TWITTER,
                uniqueKey: `${OAuthProvider.TWITTER}:999`,
                createdAt: Date.now(),
                providerAccountId: "999",
                user: { id: "999", username: "username" },
                isLinkedToAddress: false,
                reputation: ReputationLevel.GOLD
            })
        })

        it("should change isLinkedToAddress to true and create a new token", async () => {
            const userPublicKey = "xj93Xo97GEIhaO5mHcMNMfNnS5YReu/kexbGHIOtGXU="
            const token = await linkAccounts({
                accountId: accountMock.id,
                address: addy,
                userSignature: "signature",
                userPublicKey
            })

            const account = await OAuthAccount.findById(accountMock.id)

            const savedToken = await Token.findById(token.id)

            if (!savedToken) throw new Error("Token was not saved")

            expect(account!.isLinkedToAddress).toBe(true)
            expect(savedToken.userAddress).toBe(addy)
            expect(typeof savedToken.decimalId).toBe("string")
            expect(encryptMessageWithSalt).toHaveBeenCalledWith(
                userPublicKey,
                '{"attestationMessage":"{\\"service\\":\\"InterRep\\",\\"decimalId\\":\\"1747858295241726277510434389086057765685193028078641675200900296144941574649\\",\\"userAddress\\":\\"0x622c62E3be972ABdF172DA466d425Df4C93470E4\\",\\"provider\\":\\"twitter\\",\\"providerAccountId\\":\\"999\\"}","backendAttestationSignature":"0x9571034f3bf9a04cbaa984ee57119e50d3289fd2f815bb91c0d567312fa50e314b7d6c64b4f8d42b71fa984a625971b186a66a68eaa970416c68e288ecb978881c"}'
            )
            expect(savedToken.encryptedAttestation).toEqual("encryptedMessage")
        })
    })
})
