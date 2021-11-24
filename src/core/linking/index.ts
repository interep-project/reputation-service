import { OAuthAccount, Token, TokenDocument, TokenStatus } from "@interrep/db"
import { ReputationLevel } from "@interrep/reputation-criteria"
import { ethers } from "ethers"
import { ContractName, currentNetwork } from "src/config"
import checkIfUserSignatureIsValid from "src/core/signing/checkIfUserSignatureIsValid"
import { createBackendAttestationMessage } from "src/core/signing/createBackendAttestationMessage"
import getSigner from "src/utils/backend/getSigner"
import logger from "src/utils/backend/logger"
import { getChecksummedAddress, encryptMessageWithSalt } from "src/utils/common/crypto"
import getContractAddress from "src/utils/common/getContractAddress"
import stringToBigNumber from "src/utils/common/stringToBigNumber"

type LinkAccountsParams = {
    address: string
    accountId: string
    userSignature: string
    userPublicKey: string
}

const linkAccounts = async ({
    address,
    accountId,
    userSignature,
    userPublicKey
}: LinkAccountsParams): Promise<TokenDocument> => {
    const checksummedAddress = getChecksummedAddress(address)

    if (!checksummedAddress) {
        throw new Error(`Invalid address ${address}`)
    }

    const isUserSignatureValid = checkIfUserSignatureIsValid({
        checksummedAddress,
        accountId,
        userSignature
    })

    if (!isUserSignatureValid) {
        throw new Error(`Invalid signature`)
    }

    let account

    try {
        account = await OAuthAccount.findById(accountId)
    } catch (e) {
        logger.error(e)
        throw new Error(`Error retrieving account`)
    }

    if (!account) {
        throw new Error(`Account not found`)
    }

    if (account.isLinkedToAddress) {
        throw new Error(`Account already linked`)
    }

    if (!account.reputation || account.reputation !== ReputationLevel.GOLD) {
        throw new Error(`Insufficient account's reputation`)
    }

    const contractAddress = getContractAddress(ContractName.REPUTATION_BADGE, account.provider)

    if (!contractAddress) {
        throw new Error(`Invalid badge address ${contractAddress}`)
    }

    try {
        account.isLinkedToAddress = true

        await account.save()

        const token = new Token({
            chainId: currentNetwork.chainId,
            contractAddress,
            userAddress: checksummedAddress,
            provider: account.provider,
            issuanceTimestamp: Date.now(),
            status: TokenStatus.NOT_MINTED
        })

        // hash the id
        const tokenIdHash = ethers.utils.id(token.id.toString())
        // convert to BigNumber then string
        const decimalId = stringToBigNumber(tokenIdHash).toString()

        token.decimalId = decimalId

        const attestationMessage = createBackendAttestationMessage({
            decimalId,
            address: checksummedAddress,
            provider: account.provider,
            providerAccountId: account.providerAccountId
        })

        const backendSigner = await getSigner()
        const backendAttestationSignature = await backendSigner.signMessage(attestationMessage)

        logger.silly(
            `Attestation generated. Message: ${attestationMessage}. Backend Signature: ${backendAttestationSignature}`
        )

        const encryptedAttestation = encryptMessageWithSalt(
            userPublicKey,
            JSON.stringify({
                attestationMessage,
                backendAttestationSignature
            })
        )

        token.encryptedAttestation = encryptedAttestation

        await token.save()

        return token
    } catch (error) {
        logger.error(error)
        throw new Error(`Error while creating attestation`)
    }
}

export default linkAccounts
