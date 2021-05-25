import { ethers } from "ethers";
import Token from "src/models/tokens/Token.model";
import { ITokenDocument, TokenStatus } from "src/models/tokens/Token.types";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import { getChecksummedAddress } from "src/utils/crypto/address";
import {
  getBadgeAddressByProvider,
  isNetworkWithDeployedContract,
} from "src/utils/crypto/deployedContracts";
import logger from "src/utils/server/logger";
import { checkIfUserSignatureIsValid } from "src/core/signing/checkIfUserSignatureIsValid";

type CreateTokenProps = {
  chainId: number;
  address: string;
  web2AccountId: string;
  userSignature: string;
  encryptedAttestation: string;
};

const createToken = async ({
  chainId,
  address,
  web2AccountId,
  userSignature,
  encryptedAttestation,
}: CreateTokenProps): Promise<ITokenDocument> => {
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

  const badgeAddress = getBadgeAddressByProvider(web2Account.provider);

  if (!badgeAddress) {
    throw new Error(`Invalid badge address ${badgeAddress}`);
  }

  // create Token
  try {
    web2Account.isLinkedToAddress = true;
    await web2Account.save();

    const token = new Token({
      chainId,
      contractAddress: badgeAddress,
      userAddress: checksummedAddress,
      web2Provider: web2Account.provider,
      encryptedAttestation,
      issuanceTimestamp: Date.now(),
      status: TokenStatus.NOT_MINTED,
    });

    // hash the id
    const tokenIdHash = ethers.utils.id(token.id.toString());
    token.idHash = tokenIdHash;
    await token.save();

    return token;
  } catch (error) {
    logger.error(error);
    throw new Error(`Error while creating token`);
  }
};

export default createToken;
