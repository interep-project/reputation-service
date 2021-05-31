import { ContractTransaction } from "@ethersproject/contracts";
import Token from "src/models/tokens/Token.model";
import { TokenStatus } from "src/models/tokens/Token.types";
import logger from "src/utils/server/logger";
import checkAndUpdateTokenStatus from "src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus";
import mintNewToken from "src/core/blockchain/ReputationBadge/mintNewToken";

const mintToken = async (tokenId: string): Promise<ContractTransaction> => {
  const token = await Token.findById(tokenId);

  if (!token) throw new Error(`token with id ${tokenId} not found`);

  await checkAndUpdateTokenStatus([token]);

  if (token.status !== TokenStatus.NOT_MINTED) {
    throw new Error(`Can't mint a token with status ${token.status}`);
  }

  const { contractAddress, userAddress, idHash } = token;

  if (!contractAddress || !userAddress || !idHash)
    throw new Error(`Missing properties on token`);

  const txResponse = await mintNewToken({
    badgeAddress: contractAddress,
    to: userAddress,
    tokenId: idHash,
  });

  logger.silly(`[MINTING TX] Tx Response: ${JSON.stringify(txResponse)}`);

  if (txResponse) {
    const { hash, blockNumber, chainId, timestamp } = txResponse;
    token.mintTransactions?.push({
      response: { hash, blockNumber, chainId, timestamp },
    });
    token.status = TokenStatus.MINT_PENDING;
    await token.save();

    return txResponse;
  } else {
    throw new Error(`Error while submitting mint transaction`);
  }
};

export default mintToken;
