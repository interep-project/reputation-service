import { ITokenDocument, TokenStatus } from "src/models/tokens/Token.types";
import { zeroAddress } from "src/utils/crypto/constants";
import { isTransactionConfirmed } from "src/utils/crypto/isTransactionConfirmed";
import logger from "src/utils/server/logger";
import TwitterBadgeContract from "./TwitterBadgeContract";

const checkAndUpdateTokenStatus = async (tokens: ITokenDocument[]) => {
  if (!tokens) return;

  try {
    return Promise.all(
      tokens.map(async (token) => {
        const tokenId = token.decimalId;

        if (!tokenId) {
          logger.error(`Token with id ${token.id} has no decimalId`);
          throw new Error(`Token with id ${token.id} has no decimalId`);
        }
        // TODO: checking each contract might not be the most scalable solution
        // refactor to avoid explicit dependency with individual contracts?
        // TODO: Also it should check the right contract based on token.chainId
        const tokenExistsOnChain = await TwitterBadgeContract.exists(tokenId);

        if (tokenExistsOnChain) {
          if (
            token.status === TokenStatus.MINT_PENDING ||
            token.status === TokenStatus.NOT_MINTED
          ) {
            token.status = TokenStatus.MINTED;
            await token.save();
            return;
          }
        } else {
          if (
            token.status === TokenStatus.NOT_MINTED ||
            token.status === TokenStatus.REVOKED
          ) {
            return;
          } else if (token.status === TokenStatus.MINT_PENDING) {
            if (!token.mintTransactions) {
              logger.error(
                `Token status is MINT_PENDING but no mint tx was found. Token id: ${tokenId}`
              );
              throw new Error("Error updating token status");
            }
            // if at least one minting tx is not confirmed, the status is still pending
            const promises = token.mintTransactions.map((tx) =>
              isTransactionConfirmed(tx.response.hash)
            );
            const results = await Promise.all(promises);
            const pendingTransactionIndex = results.findIndex(
              (isTxConfirmed) => isTxConfirmed === false
            );
            if (pendingTransactionIndex !== -1) return;

            token.status = TokenStatus.NOT_MINTED;
            await token.save();
          } else {
            const burnedEvents = await TwitterBadgeContract.getTransferEvent(
              undefined,
              zeroAddress,
              tokenId
            );

            if (burnedEvents.length > 0) {
              token.status = TokenStatus.BURNED;
              await token.save();
            } else {
              logger.error(
                `Token does not exist but no burned event was found. Token id: ${tokenId}`
              );
              throw new Error("Error updating token status");
            }
          }
        }
      })
    );
  } catch (err) {
    throw new Error(`Error while updating tokens: ${err}`);
  }
};

export default checkAndUpdateTokenStatus;
