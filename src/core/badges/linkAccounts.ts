import { OAuthAccountDocument, Token, TokenDocument } from "@interrep/db"
import { ethers } from "ethers"
import { ContractName, currentNetwork } from "src/config"
import getSigner from "src/utils/backend/getSigner"
import { encryptMessageWithSalt } from "src/utils/common/crypto"
import getContractAddress from "src/utils/common/getContractAddress"
import stringToBigNumber from "src/utils/common/stringToBigNumber"

/**
 * Links a Web2 account with a Web3 account (Ethereum) creating a token ready to be minted.
 * The token contains an encrypted link attestation which only the user can decrypt.
 * @param account The OAuth account db document.
 * @param userAddress The address of the user.
 * @param userPublicKey The public key of the user.
 * @returns The token created.
 */
export default async function linkAccounts(
    account: OAuthAccountDocument,
    userAddress: string,
    userPublicKey: string
): Promise<TokenDocument> {
    const backendSigner = await getSigner()
    const contractAddress = getContractAddress(ContractName.REPUTATION_BADGE, account.provider)

    const token = new Token({
        chainId: currentNetwork.chainId,
        contractAddress,
        userAddress,
        provider: account.provider,
        issuanceTimestamp: Date.now()
    })

    // The token id will be used as ERC721 id onchain.
    const tokenIdHash = ethers.utils.id(token.id.toString())
    token.tokenId = stringToBigNumber(tokenIdHash).toString()

    // The backend attestation message contains all the parameters needed to identify the user token and the two accounts (Web2/Web3).
    const attestationMessage = JSON.stringify([token.tokenId, userAddress, account.provider, account.providerAccountId])
    const attestationSignature = await backendSigner.signMessage(attestationMessage)

    token.encryptedAttestation = encryptMessageWithSalt(
        userPublicKey,
        JSON.stringify([attestationMessage, attestationSignature])
    )

    account.isLinkedToAddress = true

    await token.save()
    await account.save()

    return token
}
