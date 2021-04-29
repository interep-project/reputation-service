import { ethers } from "ethers";
import Token from "src/models/tokens/Token.model";
import { ITokenDocument } from "src/models/tokens/Token.types";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import { getChecksummedAddress } from "src/utils/crypto/address";
import logger from "src/utils/server/logger";
import { createAssociationMessage } from "./signature";

type LinkAccountsProps = {
  address: string;
  web2AccountId: string;
  signature: string;
};

const linkAccounts = async ({
  address,
  web2AccountId,
  signature,
}: LinkAccountsProps): Promise<ITokenDocument> => {
  const checksummedAddress = getChecksummedAddress(address);

  if (!checksummedAddress) {
    throw new Error(`Invalid address ${address}`);
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

  const recreatedMessage = createAssociationMessage({
    address,
    web2AccountId: web2AccountId,
  });
  const signerAddress = ethers.utils.verifyMessage(recreatedMessage, signature);

  if (signerAddress !== checksummedAddress) {
    throw new Error(`Invalid signature`);
  }

  try {
    web2Account.isLinkedToAddress = true;
    await web2Account.save();

    const token = await Token.create({
      userAddress: checksummedAddress,
      web2Account: web2AccountId,
      issuanceTimestamp: Date.now(),
    });

    return token;
  } catch (error) {
    logger.error(error);
    throw new Error(`Error while creating token`);
  }
};

export default linkAccounts;
