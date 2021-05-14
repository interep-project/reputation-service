import { ethers } from "ethers";
import Token from "src/models/tokens/Token.model";
import { ITokenDocument } from "src/models/tokens/Token.types";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import { BasicReputation } from "src/models/web2Accounts/Web2Account.types";
import { getChecksummedAddress } from "src/utils/crypto/address";
import logger from "src/utils/server/logger";
import mintNewBadge from "src/core/blockchain/ReputationBadge/mintNewBadge";
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

  if (
    !web2Account.basicReputation ||
    web2Account.basicReputation !== BasicReputation.CONFIRMED
  ) {
    throw new Error(`Insufficient account's reputation`);
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

    // hash the id
    const tokenIdHash = ethers.utils.id(token.id.toString());

    token.idHash = tokenIdHash;
    await token.save();

    const txHash = await mintNewBadge({
      badgeAddress: "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be",
      to: checksummedAddress,
      tokenId: tokenIdHash,
    });

    if (txHash) {
      console.log(`txHash`, txHash);
    }

    return token;
  } catch (error) {
    logger.error(error);
    throw new Error(`Error while creating token`);
  }
};

export default linkAccounts;
