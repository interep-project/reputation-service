import { TokenDocument, TokenStatus } from "@interrep/db"
import { exists } from "../contracts/ReputationBadge"

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
