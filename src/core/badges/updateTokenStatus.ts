import { TokenDocument, TokenStatus } from "@interrep/db"
import { exists } from "../contracts/ReputationBadge"

/**
 * Since users can burn their tokens by interacting directly with contracts,
 * InterRep should check if the tokens have been burned and update the status if so.
 * @param tokens A list of tokens to check.
 */
export default async function updateTokenStatus(tokens: TokenDocument[]): Promise<void> {
    for (const token of tokens) {
        if (token.status === TokenStatus.MINTED) {
            if (!(await exists(token.tokenId, token.provider))) {
                token.status = TokenStatus.BURNED

                await token.save()
            }
        }
    }
}
