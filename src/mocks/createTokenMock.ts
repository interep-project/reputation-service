import { TokenData, TokenDocument } from "@interrep/db"
import { OAuthProvider } from "@interrep/reputation"

export default function createTokenMock(override?: Partial<TokenDocument>): TokenData {
    return {
        provider: OAuthProvider.TWITTER,
        userAddress: "0xBf493eD72eE6017F5b0dD02AaC0EAC41a735b182",
        tokenId: "1",
        encryptedAttestation: "encryptedAttestation",
        ...override
    }
}
