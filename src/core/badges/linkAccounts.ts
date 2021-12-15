import { OAuthAccount, Token, TokenDocument } from "@interrep/db"
import { ReputationLevel } from "@interrep/reputation"
import { ethers } from "ethers"
import { ContractName, currentNetwork } from "src/config"
import checkIfUserSignatureIsValid from "src/core/signing/checkIfUserSignatureIsValid"
import { createBackendAttestationMessage } from "src/core/signing/createBackendAttestationMessage"
import getSigner from "src/utils/backend/getSigner"
import logger from "src/utils/backend/logger"
import { encryptMessageWithSalt, getChecksummedAddress } from "src/utils/common/crypto"
import getContractAddress from "src/utils/common/getContractAddress"
import stringToBigNumber from "src/utils/common/stringToBigNumber"

export default async function linkAccounts(
    userAddress: string,
    userSignature: string,
    userPublicKey: string,
    accountId: string
): Promise<TokenDocument> {
    const checksummedAddress = getChecksummedAddress(userAddress)

    if (!checksummedAddress) {
        throw new Error(`Invalid address ${userAddress}`)
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
            issuanceTimestamp: Date.now()
        })

        const tokenIdHash = ethers.utils.id(token.id.toString())
        token.tokenId = stringToBigNumber(tokenIdHash).toString()

        const attestationMessage = createBackendAttestationMessage({
            tokenId: token.tokenId,
            userAddress: checksummedAddress,
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
