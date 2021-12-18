import { TokenDocument, TokenStatus } from "@interrep/db"
import { safeMint } from "src/core/contracts/ReputationBadge"

/**
 * Mints a token onchain. If the transaction is successful it adds the transaction
 * hash and the block number in the token entity and update the token status to 'MINTED'.
 * @param token The token db document.
 */
export default async function mintToken(token: TokenDocument): Promise<void> {
    if (token.status) {
        throw new Error(`You cannot mint a token with status ${token.status}`)
    }

    const { provider, userAddress, tokenId } = token
    const transaction = await safeMint(userAddress, tokenId, provider)

    token.transaction = {
        hash: transaction.transactionHash,
        blockNumber: transaction.blockNumber
    }

    token.status = TokenStatus.MINTED

    await token.save()
}
