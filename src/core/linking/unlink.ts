import { ethers } from "hardhat";
import Token from "src/models/tokens/Token.model";
import { TokenStatus } from "src/models/tokens/Token.types";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import checkAndUpdateTokenStatus from "../blockchain/ReputationBadge/checkAndUpdateTokenStatus";

const getError = (message: string) => ({
  success: false,
  error: message,
});

type UnlinkAccountsParams = {
  web2AccountIdFromSession: string;
  decryptedAttestation: string;
};

const unlinkAccounts = async ({
  web2AccountIdFromSession,
  decryptedAttestation,
}: UnlinkAccountsParams): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> => {
  const web2Account = await Web2Account.findById(web2AccountIdFromSession);

  if (!web2Account) {
    return getError("Unable to find web2Account");
  }

  if (!web2Account.isLinkedToAddress) {
    return { success: false, message: "Web 2 account is not linked" };
  }

  const parsedAttestation = JSON.parse(decryptedAttestation);

  if (!parsedAttestation.message) {
    return getError("Invalid attestation provided");
  }

  const { attestationMessage, backendAttestationSignature } = JSON.parse(
    parsedAttestation.message
  );

  const [backendSigner] = await ethers.getSigners();
  const signerAddress = ethers.utils.verifyMessage(
    attestationMessage,
    backendAttestationSignature
  );

  if (signerAddress != backendSigner.address) {
    return getError("Attestation signature invalid");
  }

  const { tokenIdHash, web2Provider, providerAccountId } = JSON.parse(
    attestationMessage
  );

  const web2AccountFromAttestation = await Web2Account.findByProviderAccountId(
    web2Provider,
    providerAccountId
  );

  const web2AccountFromAttestationObject = web2AccountFromAttestation?.toObject();

  if (
    !web2AccountFromAttestationObject ||
    web2AccountFromAttestationObject._id.toString() !==
      web2Account._id.toString()
  ) {
    return getError("Web 2 accounts don't match");
  }

  const token = await Token.findOne({ idHash: tokenIdHash });

  if (!token) {
    return getError(`Can't find token with idHash ${tokenIdHash}`);
  }

  await checkAndUpdateTokenStatus([token]);

  if (token.status !== TokenStatus.BURNED) {
    return {
      success: false,
      message:
        "The on-chain token associated with the web 2 account you are connected with needs to be burned first.",
    };
  }

  token.status = TokenStatus.REVOKED;
  await token.save();

  web2Account.isLinkedToAddress = false;
  await web2Account.save();

  return { success: true, message: "Accounts were successfully un-linked" };
};

export default unlinkAccounts;
