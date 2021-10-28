import { OAuthProvider } from "@interrep/reputation-criteria"
import { TokenDocument, TokenStatus } from "@interrep/data-models"

const createMockTokenObject = (override?: Partial<TokenDocument>) => ({
    contractAddress: "0x8398bCD4f633C72939F9043dB78c574A91C99c0A",
    userAddress: "0xBf493eD72eE6017F5b0dD02AaC0EAC41a735b182",
    issuanceTimestamp: Date.now(),
    provider: OAuthProvider.TWITTER,
    chainId: 33137,
    status: TokenStatus.NOT_MINTED,
    decimalId: "99841047636891000514743136290083633803587659719163489038083863229813808784161",
    encryptedAttestation: "encryptedAttestation",
    ...override
})

export default createMockTokenObject
