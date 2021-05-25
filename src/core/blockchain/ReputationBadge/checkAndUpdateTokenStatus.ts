import { ITokenDocument, TokenStatus } from "src/models/tokens/Token.types";
import logger from "src/utils/server/logger";
import TwitterBadgeContract from "./TwitterBadgeContract";

const checkAndUpdateTokenStatus = async (tokens: ITokenDocument[]) => {
  if (!tokens) return;

  try {
    await Promise.all(
      tokens.map(async (token) => {
        const tokenId = token.idHash;
        if (tokenId) {
          // TODO: checking each contract might not be the most scalable solution
          // refactor to avoid explicit dependency with individual contracts?
          const tokenExistsOnChain = await TwitterBadgeContract.exists(tokenId);

          if (tokenExistsOnChain) {
            if (token.status === TokenStatus.MINT_PENDING) {
              token.status = TokenStatus.MINTED;
              await token.save();
            }
          } else {
            if (token.status === TokenStatus.NOT_MINTED) {
              return;
            } else if (token.status === TokenStatus.MINT_PENDING) {
              token.status = TokenStatus.NOT_MINTED;
              await token.save();
            } else {
              const burnedEvent = await TwitterBadgeContract.getBurnedEvent(
                undefined,
                tokenId
              );

              if (burnedEvent.length > 0) {
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
        }
      })
    );
  } catch (err) {
    throw new Error(`Error while updating tokens: ${err}`);
  }
};

export default checkAndUpdateTokenStatus;
