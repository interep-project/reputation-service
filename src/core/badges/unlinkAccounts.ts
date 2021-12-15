import { ethers } from "ethers"
import { TokenStatus, Token, OAuthAccount } from "@interrep/db"
import getSigner from "src/utils/backend/getSigner"
import updateTokenStatus from "./updateTokenStatus"

export default async function unlinkAccounts(decryptedAttestation: string, accountId: string): Promise<void> {
    const account = await OAuthAccount.findById(accountId)

    if (!account) {
        throw new Error("Unable to find account")
    }

    if (!account.isLinkedToAddress) {
        throw new Error("Account is not linked")
    }

    const parsedAttestation = JSON.parse(decryptedAttestation)

    if (!parsedAttestation.message) {
        throw new Error("Invalid attestation provided")
    }

    const { attestationMessage, backendAttestationSignature } = JSON.parse(parsedAttestation.message)

    const backendSigner = await getSigner()
    const signerAddress = ethers.utils.verifyMessage(attestationMessage, backendAttestationSignature)

    if (signerAddress !== (await backendSigner.getAddress())) {
        throw new Error("Attestation signature invalid")
    }

    const { tokenId, provider, providerAccountId } = JSON.parse(attestationMessage)

    const accountFromAttestation = await OAuthAccount.findByProviderAccountId(provider, providerAccountId)

    const accountFromAttestationObject = accountFromAttestation?.toObject()

    if (!accountFromAttestationObject || accountFromAttestationObject._id.toString() !== account._id.toString()) {
        throw new Error("Accounts don't match")
    }

    const token = await Token.findOne({ tokenId })

    if (!token) {
        throw new Error(`Can't find token with tokenId ${tokenId}`)
    }

    await updateTokenStatus([token])

    if (token.status !== TokenStatus.BURNED) {
        throw new Error(
            "The on-chain token associated with the account you are connected with needs to be burned first."
        )
    }

    account.isLinkedToAddress = false

    await account.save()
}
