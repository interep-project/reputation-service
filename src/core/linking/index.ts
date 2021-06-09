import { ethers } from "hardhat";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import { BasicReputation } from "src/models/web2Accounts/Web2Account.types";
import { getChecksummedAddress } from "src/utils/crypto/address";
import logger from "src/utils/server/logger";
import { checkIfUserSignatureIsValid } from "src/core/signing/checkIfUserSignatureIsValid";
import { createBackendAttestationMessage } from "src/core/signing/createBackendAttestationMessage";
import Token from "src/models/tokens/Token.model";
import {
  getBadgeAddressByProvider,
  isNetworkWithDeployedContract,
} from "src/utils/crypto/deployedContracts";
import { ITokenDocument, TokenStatus } from "src/models/tokens/Token.types";
import { encryptMessageWithSalt } from "src/utils/crypto/encryption";
import { stringToBigNumber } from "src/utils/crypto/bigNumber";

type LinkAccountsParams = {
  chainId: number;
  address: string;
  web2AccountId: string;
  userSignature: string;
  userPublicKey: string;
};

const linkAccounts = async ({
  chainId,
  address,
  web2AccountId,
  userSignature,
  userPublicKey,
}: LinkAccountsParams): Promise<ITokenDocument> => {
  if (!isNetworkWithDeployedContract(chainId)) {
    throw new Error(`Invalid network id ${chainId}`);
  }

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

  const badgeAddress = getBadgeAddressByProvider(web2Account.provider);

  if (!badgeAddress) {
    throw new Error(`Invalid badge address ${badgeAddress}`);
  }

  try {
    web2Account.isLinkedToAddress = true;
    await web2Account.save();

    const token = new Token({
      chainId,
      contractAddress: badgeAddress,
      userAddress: checksummedAddress,
      web2Provider: web2Account.provider,
      issuanceTimestamp: Date.now(),
      status: TokenStatus.NOT_MINTED,
    });

    // hash the id
    const tokenIdHash = ethers.utils.id(token.id.toString());
    // convert to BigNumber then string
    const decimalId = stringToBigNumber(tokenIdHash).toString();

    token.decimalId = decimalId;

    const attestationMessage = createBackendAttestationMessage({
      decimalId,
      address: checksummedAddress,
      provider: web2Account.provider,
      providerAccountId: web2Account.providerAccountId,
    });

    const [backendSigner] = await ethers.getSigners();
    const backendAttestationSignature = await backendSigner.signMessage(
      attestationMessage
    );

    logger.silly(
      `Attestation generated. Message: ${attestationMessage}. Backend Signature: ${backendAttestationSignature}`
    );

    const encryptedAttestation = encryptMessageWithSalt(
      userPublicKey,
      JSON.stringify({
        attestationMessage,
        backendAttestationSignature,
      })
    );

    token.encryptedAttestation = encryptedAttestation;
    await token.save();

    return token;
  } catch (error) {
    logger.error(error);
    throw new Error(`Error while creating attestation`);
  }
};

export default linkAccounts;
