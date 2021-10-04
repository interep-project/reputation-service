import { Web2Provider } from "@interrep/reputation-criteria"
import { Wallet } from "ethers"
import checkAndUpdateTokenStatus from "src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus"
import createMockTokenObject from "src/mocks/createMockToken"
import Token from "src/models/tokens/Token.model"
import { TokenStatus } from "src/models/tokens/Token.types"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import { clearDatabase, connect, dropDatabaseAndDisconnect } from "src/utils/server/testDatabase"
import { createBackendAttestationMessage } from "../signing/createBackendAttestationMessage"
import unlinkAccounts from "./unlink"

const mockedSigner = Wallet.fromMnemonic("test test test test test test test test test test test junk")

jest.mock("src/utils/crypto/getSigner", () => ({
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
        await connect()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    afterEach(async () => {
        await clearDatabase()
    })

    it("should return an error if the web 2 account is not found", async () => {
        const fun = () =>
            unlinkAccounts({
                web2AccountIdFromSession: "608c4a10c994a377e232df7f",
                decryptedAttestation: "attestation"
            })

        await expect(fun()).rejects.toThrow("Unable to find web2Account")
    })

    it("should return an error is the account is not linked", async () => {
        const web2Account = await Web2Account.create({
            provider: Web2Provider.TWITTER,
            uniqueKey: `${Web2Provider.TWITTER}:twitter`,
            createdAt: Date.now(),
            isLinkedToAddress: false,
            providerAccountId: "twitter"
        })

        const fun = () =>
            unlinkAccounts({
                web2AccountIdFromSession: web2Account.id,
                decryptedAttestation: "attestation"
            })

        await expect(fun()).rejects.toThrow("Web 2 account is not linked")
    })

    it("should return an error if the attestation has no message field", async () => {
        const web2Account = await Web2Account.create({
            provider: Web2Provider.TWITTER,
            uniqueKey: `${Web2Provider.TWITTER}:twitter`,
            createdAt: Date.now(),
            isLinkedToAddress: true,
            providerAccountId: "twitter"
        })

        const fun = () =>
            unlinkAccounts({
                web2AccountIdFromSession: web2Account.id,
                decryptedAttestation: JSON.stringify({ salt: "0xef4", message: "" })
            })

        await expect(fun()).rejects.toThrow("Invalid attestation provided")
    })

    it("should return an error if the message was not signed by the backend", async () => {
        const web2Account = await Web2Account.create({
            provider: Web2Provider.TWITTER,
            uniqueKey: `${Web2Provider.TWITTER}:twitter`,
            createdAt: Date.now(),
            isLinkedToAddress: true,
            providerAccountId: "twitter"
        })

        const otherSigner = Wallet.createRandom()

        const attestationMessage = "attestationMessage"

        const backendAttestationSignature = await otherSigner.signMessage(attestationMessage)

        const fun = () =>
            unlinkAccounts({
                web2AccountIdFromSession: web2Account.id,
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

    it("should return an error if the web 2 account in the attestation does not match the one provided", async () => {
        const web2Account1 = await Web2Account.create({
            provider: Web2Provider.TWITTER,
            uniqueKey: `${Web2Provider.TWITTER}:id1`,
            createdAt: Date.now(),
            isLinkedToAddress: true,
            providerAccountId: "id1"
        })

        const web2Account2 = await Web2Account.create({
            provider: Web2Provider.TWITTER,
            uniqueKey: `${Web2Provider.TWITTER}:id2`,
            createdAt: Date.now(),
            isLinkedToAddress: true,
            providerAccountId: "id2"
        })

        const { attestationMessage, backendAttestationSignature } = await createMockBackendAttestation({
            providerAccountId: web2Account1.providerAccountId
        })

        const fun = () =>
            unlinkAccounts({
                web2AccountIdFromSession: web2Account2.id,
                decryptedAttestation: JSON.stringify({
                    salt: "0x4fe",
                    message: JSON.stringify({
                        attestationMessage,
                        backendAttestationSignature
                    })
                })
            })

        await expect(fun()).rejects.toThrow("Web 2 accounts don't match")
    })

    it("should return an error if the token in the attestation can't be found", async () => {
        const web2Account = await Web2Account.create({
            provider: Web2Provider.TWITTER,
            uniqueKey: `${Web2Provider.TWITTER}:id3`,
            createdAt: Date.now(),
            isLinkedToAddress: true,
            providerAccountId: "id3"
        })

        const { attestationMessage, backendAttestationSignature } = await createMockBackendAttestation({
            providerAccountId: web2Account.providerAccountId
        })

        const fun = () =>
            unlinkAccounts({
                web2AccountIdFromSession: web2Account.id,
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

        const web2Account = await Web2Account.create({
            provider: Web2Provider.TWITTER,
            uniqueKey: `${Web2Provider.TWITTER}:id3`,
            createdAt: Date.now(),
            isLinkedToAddress: true,
            providerAccountId: "id3"
        })

        const { attestationMessage, backendAttestationSignature } = await createMockBackendAttestation({
            providerAccountId: web2Account.providerAccountId,
            decimalId: token.decimalId
        })

        const fun = () =>
            unlinkAccounts({
                web2AccountIdFromSession: web2Account.id,
                decryptedAttestation: JSON.stringify({
                    salt: "0x4fe",
                    message: JSON.stringify({
                        attestationMessage,
                        backendAttestationSignature
                    })
                })
            })

        await expect(fun()).rejects.toThrow(
            "The on-chain token associated with the web 2 account you are connected with needs to be burned first."
        )
    })

    it("should update web 2 account and mark token as REVOKED", async () => {
        const token = await Token.create(createMockTokenObject())

        if (!token.decimalId) throw new Error("Token creation failed")

        // @ts-ignore: mocked above
        checkAndUpdateTokenStatus.mockImplementationOnce(async ([token]) => {
            token.status = "BURNED"
            await token.save()
        })

        const web2Account = await Web2Account.create({
            provider: Web2Provider.TWITTER,
            uniqueKey: `${Web2Provider.TWITTER}:id3`,
            createdAt: Date.now(),
            isLinkedToAddress: true,
            providerAccountId: "id3"
        })

        const { attestationMessage, backendAttestationSignature } = await createMockBackendAttestation({
            providerAccountId: web2Account.providerAccountId,
            decimalId: token.decimalId
        })

        await unlinkAccounts({
            web2AccountIdFromSession: web2Account.id,
            decryptedAttestation: JSON.stringify({
                salt: "0x4fe",
                message: JSON.stringify({
                    attestationMessage,
                    backendAttestationSignature
                })
            })
        })

        const savedToken = await Token.findById(token.id)
        const savedWeb2Account = await Web2Account.findById(web2Account.id)

        expect(savedToken?.status).toEqual(TokenStatus.REVOKED)
        expect(savedWeb2Account?.isLinkedToAddress).toEqual(false)
    })
})
