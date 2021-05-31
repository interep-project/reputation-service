import { ITokenDocument, TokenStatus } from "src/models/tokens/Token.types";
import { Web2Providers } from "src/models/web2Accounts/Web2Account.types";
import { getDefaultNetworkId } from "src/utils/crypto/getDefaultNetwork";

const createMockTokenObject = (override?: Partial<ITokenDocument>) => ({
  contractAddress: "0x8398bCD4f633C72939F9043dB78c574A91C99c0A",
  issuanceTimestamp: Date.now(),
  web2Provider: Web2Providers.TWITTER,
  chainId: getDefaultNetworkId(),
  status: TokenStatus.NOT_MINTED,
  idHash: "0x03dd40b36474bf4559c4d733be6f5ec1e61bcb562d1c7f04629ee3af7ee569f9",
  encryptedAttestation: "encryptedAttestation",
  ...override,
});

export default createMockTokenObject;
