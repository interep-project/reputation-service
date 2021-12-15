import { TokenDocument } from "@interrep/db"
import { OAuthProvider } from "@interrep/reputation"

export default function createMockTokenObject(override?: Partial<TokenDocument>) {
    return {
        userAddress: "0xBf493eD72eE6017F5b0dD02AaC0EAC41a735b182",
        provider: OAuthProvider.TWITTER,
        tokenId: "99841047636891000514743136290083633803587659719163489038083863229813808784161",
        encryptedAttestation: "encryptedAttestation",
        ...override
    }
}
