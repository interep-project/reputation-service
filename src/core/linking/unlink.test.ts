import { OAuthProvider } from "@interrep/reputation-criteria"
import { Wallet } from "ethers"
import checkAndUpdateTokenStatus from "src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus"
import createMockTokenObject from "src/mocks/createMockToken"
import { TokenStatus, Token, OAuthAccount } from "@interrep/db"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import { createBackendAttestationMessage } from "../signing/createBackendAttestationMessage"
import unlinkAccounts from "./unlink"

const mockedSigner = Wallet.fromMnemonic("test test test test test test test test test test test junk")

jest.mock("src/utils/backend/getSigner", () => ({
    __esModule: true,
    default: jest.fn(() => mockedSigner)
}))

jest.mock("src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus", () => ({
    __esModule: true,
    default: jest.fn()
}))

const createMockBackendAttestation = async ({
    providerAccountId,
    decimalId
}: {
    providerAccountId: string
    decimalId?: string
}): Promise<{
    attestationMessage: string
    backendAttestationSignature: string
}> => {
    const attestationMessage = createBackendAttestationMessage({
        providerAccountId,
        provider: "twitter",
        address: "0x",
        decimalId: decimalId || "573930924"
    })

    const backendAttestationSignature = await mockedSigner.signMessage(attestationMessage)

    return { attestationMessage, backendAttestationSignature }
}

describe("unlink", () => {
    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    afterEach(async () => {
        await clearDatabase()
    })

    it("should return an error if the account is not found", async () => {
        const fun = () =>
            unlinkAccounts({
                accountIdFromSession: "608c4a10c994a377e232df7f",
                decryptedAttestation: "attestation"
            })

        await expect(fun()).rejects.toThrow("Unable to find account")
    })

    it("should return an error is the account is not linked", async () => {
        const account = await OAuthAccount.create({
            provider: OAuthProvider.TWITTER,
            uniqueKey: `${OAuthProvider.TWITTER}:twitter`,
            createdAt: Date.now(),
            isLinkedToAddress: false,
            providerAccountId: "twitter"
        })

        const fun = () =>
            unlinkAccounts({
                accountIdFromSession: account.id,
                decryptedAttestation: "attestation"
            })

        await expect(fun()).rejects.toThrow("Account is not linked")
    })

    it("should return an error if the attestation has no message field", async () => {
        const account = await OAuthAccount.create({
            provider: OAuthProvider.TWITTER,
            uniqueKey: `${OAuthProvider.TWITTER}:twitter`,
            createdAt: Date.now(),
            isLinkedToAddress: true,
            providerAccountId: "twitter"
        })

        const fun = () =>
            unlinkAccounts({
                accountIdFromSession: account.id,
                decryptedAttestation: JSON.stringify({ salt: "0xef4", message: "" })
            })

        await expect(fun()).rejects.toThrow("Invalid attestation provided")
    })

    it("should return an error if the message was not signed by the backend", async () => {
        const account = await OAuthAccount.create({
            provider: OAuthProvider.TWITTER,
            uniqueKey: `${OAuthProvider.TWITTER}:twitter`,
            createdAt: Date.now(),
            isLinkedToAddress: true,
            providerAccountId: "twitter"
        })

        const otherSigner = Wallet.createRandom()

        const attestationMessage = "attestationMessage"

        const backendAttestationSignature = await otherSigner.signMessage(attestationMessage)

        const fun = () =>
            unlinkAccounts({
                accountIdFromSession: account.id,
                decryptedAttestation: JSON.stringify({
                    salt: "0x4fe",
                    message: JSON.stringify({
                        attestationMessage,
                        backendAttestationSignature
                    })
                })
            })

        await expect(fun()).rejects.toThrow("Attestation signature invalid")
    })

    it("should return an error if the account in the attestation does not match the one provided", async () => {
        const account1 = await OAuthAccount.create({
            provider: OAuthProvider.TWITTER,
            uniqueKey: `${OAuthProvider.TWITTER}:id1`,
            createdAt: Date.now(),
            isLinkedToAddress: true,
            providerAccountId: "id1"
        })

        const account2 = await OAuthAccount.create({
            provider: OAuthProvider.TWITTER,
            uniqueKey: `${OAuthProvider.TWITTER}:id2`,
            createdAt: Date.now(),
            isLinkedToAddress: true,
            providerAccountId: "id2"
        })

        const { attestationMessage, backendAttestationSignature } = await createMockBackendAttestation({
            providerAccountId: account1.providerAccountId
        })

        const fun = () =>
            unlinkAccounts({
                accountIdFromSession: account2.id,
                decryptedAttestation: JSON.stringify({
                    salt: "0x4fe",
                    message: JSON.stringify({
                        attestationMessage,
                        backendAttestationSignature
                    })
                })
            })

        await expect(fun()).rejects.toThrow("Accounts don't match")
    })

    it("should return an error if the token in the attestation can't be found", async () => {
        const account = await OAuthAccount.create({
            provider: OAuthProvider.TWITTER,
            uniqueKey: `${OAuthProvider.TWITTER}:id3`,
            createdAt: Date.now(),
            isLinkedToAddress: true,
            providerAccountId: "id3"
        })

        const { attestationMessage, backendAttestationSignature } = await createMockBackendAttestation({
            providerAccountId: account.providerAccountId
        })

        const fun = () =>
            unlinkAccounts({
                accountIdFromSession: account.id,
                decryptedAttestation: JSON.stringify({
                    salt: "0x4fe",
                    message: JSON.stringify({
                        attestationMessage,
                        backendAttestationSignature
                    })
                })
            })

        await expect(fun()).rejects.toThrow("Can't find token with decimalId 573930924")
    })

    it("should not proceed with a token that is not burned", async () => {
        const token = await Token.create(createMockTokenObject())

        if (!token.decimalId) throw new Error("Token creation failed")

        // @ts-ignore: mocked above
        checkAndUpdateTokenStatus.mockImplementationOnce(async ([token]) => {
            token.status = "MINTED"
            await token.save()
        })

        const account = await OAuthAccount.create({
            provider: OAuthProvider.TWITTER,
            uniqueKey: `${OAuthProvider.TWITTER}:id3`,
            createdAt: Date.now(),
            isLinkedToAddress: true,
            providerAccountId: "id3"
        })

        const { attestationMessage, backendAttestationSignature } = await createMockBackendAttestation({
            providerAccountId: account.providerAccountId,
            decimalId: token.decimalId
        })

        const fun = () =>
            unlinkAccounts({
                accountIdFromSession: account.id,
                decryptedAttestation: JSON.stringify({
                    salt: "0x4fe",
                    message: JSON.stringify({
                        attestationMessage,
                        backendAttestationSignature
                    })
                })
            })

        await expect(fun()).rejects.toThrow(
            "The on-chain token associated with the account you are connected with needs to be burned first."
        )
    })

    it("should update account and mark token as REVOKED", async () => {
        const token = await Token.create(createMockTokenObject())

        if (!token.decimalId) throw new Error("Token creation failed")

        // @ts-ignore: mocked above
        checkAndUpdateTokenStatus.mockImplementationOnce(async ([token]) => {
            token.status = "BURNED"
            await token.save()
        })

        const account = await OAuthAccount.create({
            provider: OAuthProvider.TWITTER,
            uniqueKey: `${OAuthProvider.TWITTER}:id3`,
            createdAt: Date.now(),
            isLinkedToAddress: true,
            providerAccountId: "id3"
        })

        const { attestationMessage, backendAttestationSignature } = await createMockBackendAttestation({
            providerAccountId: account.providerAccountId,
            decimalId: token.decimalId
        })

        await unlinkAccounts({
            accountIdFromSession: account.id,
            decryptedAttestation: JSON.stringify({
                salt: "0x4fe",
                message: JSON.stringify({
                    attestationMessage,
                    backendAttestationSignature
                })
            })
        })

        const savedToken = await Token.findById(token.id)
        const savedAccount = await OAuthAccount.findById(account.id)

        expect(savedToken?.status).toEqual(TokenStatus.REVOKED)
        expect(savedAccount?.isLinkedToAddress).toEqual(false)
    })
})
