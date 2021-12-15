import { TokenDocument, TokenStatus } from "@interrep/db"
import { safeMint } from "src/core/contracts/ReputationBadge"

export default async function mintToken(token: TokenDocument): Promise<void> {
    if (token.status) {
        throw new Error(`Can't mint a token with status ${token.status}`)
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
