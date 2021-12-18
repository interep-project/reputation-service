import { OAuthAccountDocument, TokenDocument, TokenStatus } from "@interrep/db"
import updateTokenStatus from "./updateTokenStatus"

/**
 * Unlinks two Web2/Web3 accounts.
 * @param account The OAuth db document.
 * @param token The token db document.
 */
export default async function unlinkAccounts(account: OAuthAccountDocument, token: TokenDocument): Promise<void> {
    if (!account.isLinkedToAddress) {
        throw new Error("The account has not been linked yet")
    }

    await updateTokenStatus([token])

    if (token.status !== TokenStatus.BURNED) {
        throw new Error("The attestation token has not been burned yet")
    }

    account.isLinkedToAddress = false

    await account.save()
}
