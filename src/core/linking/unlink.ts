import { ethers } from "ethers"
import Token from "src/models/tokens/Token.model"
import { TokenStatus } from "src/models/tokens/Token.types"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import getSigner from "src/utils/backend/getSigner"
import checkAndUpdateTokenStatus from "../blockchain/ReputationBadge/checkAndUpdateTokenStatus"

type UnlinkAccountsParams = {
    web2AccountIdFromSession: string
    decryptedAttestation: string
}

const unlinkAccounts = async ({
    web2AccountIdFromSession,
    decryptedAttestation
}: UnlinkAccountsParams): Promise<void> => {
    const web2Account = await Web2Account.findById(web2AccountIdFromSession)

    if (!web2Account) {
        throw new Error("Unable to find web2Account")
    }

    if (!web2Account.isLinkedToAddress) {
        throw new Error("Web 2 account is not linked")
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

    const { decimalId, web2Provider, providerAccountId } = JSON.parse(attestationMessage)

    const web2AccountFromAttestation = await Web2Account.findByProviderAccountId(web2Provider, providerAccountId)

    const web2AccountFromAttestationObject = web2AccountFromAttestation?.toObject()

    if (
        !web2AccountFromAttestationObject ||
        web2AccountFromAttestationObject._id.toString() !== web2Account._id.toString()
    ) {
        throw new Error("Web 2 accounts don't match")
    }

    const token = await Token.findOne({ decimalId })

    if (!token) {
        throw new Error(`Can't find token with decimalId ${decimalId}`)
    }

    await checkAndUpdateTokenStatus([token])

    if (token.status !== TokenStatus.BURNED) {
        throw new Error(
            "The on-chain token associated with the web 2 account you are connected with needs to be burned first."
        )
    }

    token.status = TokenStatus.REVOKED
    await token.save()

    web2Account.isLinkedToAddress = false
    await web2Account.save()
}

export default unlinkAccounts
