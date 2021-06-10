import { ITokenDocument, TokenStatus } from "src/models/tokens/Token.types";
import { zeroAddress } from "src/utils/crypto/constants";
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
        const tokenExistsOnChain = await TwitterBadgeContract.exists(tokenId);

        if (tokenExistsOnChain) {
          if (token.status === TokenStatus.MINT_PENDING) {
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
