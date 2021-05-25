import { ethers } from "hardhat";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import { BasicReputation } from "src/models/web2Accounts/Web2Account.types";
import { getChecksummedAddress } from "src/utils/crypto/address";
import logger from "src/utils/server/logger";
import { checkIfUserSignatureIsValid } from "src/core/signing/checkIfUserSignatureIsValid";
import { createBackendAttestationMessage } from "src/core/signing/createBackendAttestationMessage";

type GenerateAttestationParams = {
  address: string;
  web2AccountId: string;
  userSignature: string;
};

const generateAttestation = async ({
  address,
  web2AccountId,
  userSignature,
}: GenerateAttestationParams): Promise<{
  attestationMessage: string;
  backendAttestationSignature: string;
}> => {
  const checksummedAddress = getChecksummedAddress(address);

  if (!checksummedAddress) {
    throw new Error(`Invalid address ${address}`);
  }

  const isUserSignatureValid = checkIfUserSignatureIsValid({
    checksummedAddress,
    web2AccountId,
    userSignature,
  });

  if (!isUserSignatureValid) {
    throw new Error(`Invalid signature`);
  }

  let web2Account;
  try {
    web2Account = await Web2Account.findById(web2AccountId);
  } catch (e) {
    logger.error(e);
    throw new Error(`Error retrieving web 2 account`);
  }

  if (!web2Account) {
    throw new Error(`Web 2 account not found`);
  }

  if (web2Account.isLinkedToAddress) {
    throw new Error(`Web 2 account already linked`);
  }

  if (
    !web2Account.basicReputation ||
    web2Account.basicReputation !== BasicReputation.CONFIRMED
  ) {
    throw new Error(`Insufficient account's reputation`);
  }

  const attestationMessage = createBackendAttestationMessage({
    address: checksummedAddress,
    provider: web2Account.provider,
    providerAccountId: web2Account.providerAccountId,
  });

  try {
    const [backendSigner] = await ethers.getSigners();
    const backendAttestationSignature = await backendSigner.signMessage(
      attestationMessage
    );

    logger.silly(
      `Attestation generated. Message: ${attestationMessage}. Backend Signature: ${backendAttestationSignature}`
    );

    return {
      attestationMessage,
      backendAttestationSignature,
    };
  } catch (error) {
    logger.error(error);
    throw new Error(`Error while creating attestation`);
  }
};

export default generateAttestation;
