import { ethers } from "ethers"
import { TokenStatus, Token, OAuthAccount } from "@interrep/db"
import getSigner from "src/utils/backend/getSigner"
import checkAndUpdateTokenStatus from "../blockchain/ReputationBadge/checkAndUpdateTokenStatus"

type UnlinkAccountsParams = {
    accountIdFromSession: string
    decryptedAttestation: string
}

const unlinkAccounts = async ({ accountIdFromSession, decryptedAttestation }: UnlinkAccountsParams): Promise<void> => {
    const account = await OAuthAccount.findById(accountIdFromSession)

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

    const { decimalId, provider, providerAccountId } = JSON.parse(attestationMessage)

    const accountFromAttestation = await OAuthAccount.findByProviderAccountId(provider, providerAccountId)

    const accountFromAttestationObject = accountFromAttestation?.toObject()

    if (!accountFromAttestationObject || accountFromAttestationObject._id.toString() !== account._id.toString()) {
        throw new Error("Accounts don't match")
    }

    const token = await Token.findOne({ decimalId })

    if (!token) {
        throw new Error(`Can't find token with decimalId ${decimalId}`)
    }

    await checkAndUpdateTokenStatus([token])

    if (token.status !== TokenStatus.BURNED) {
        throw new Error(
            "The on-chain token associated with the account you are connected with needs to be burned first."
        )
    }

    token.status = TokenStatus.REVOKED
    await token.save()

    account.isLinkedToAddress = false
    await account.save()
}

export default unlinkAccounts
