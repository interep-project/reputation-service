import { NextApiRequest, NextApiResponse } from "next";
import checkAndUpdateTokenStatus from "src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus";
import mintToken from "src/core/linking/mintToken";
import Token from "src/models/tokens/Token.model";
import { ITokenDocument } from "src/models/tokens/Token.types";
import { getChecksummedAddress } from "src/utils/crypto/address";
import logger from "src/utils/server/logger";

class TokenController {
  // We can't retrieve t a web 2 account and its reputation from a token anymore
  // public getReputationByAddress = async (
  //   req: NextApiRequest,
  //   res: NextApiResponse
  // ): Promise<{
  //   address: string;
  //   results: AccountReputationByAddress[];
  // } | void> => {
  //   if (!req.query.address || typeof req.query.address !== "string") {
  //     return res.status(400).end();
  //   }

  //   // check address
  //   const address = getChecksummedAddress(req.query.address);

  //   if (!address) {
  //     return res.status(400).end();
  //   }

  //   // retrieve all tokens for this address
  //   let tokens: ITokenDocument[] | null;
  //   try {
  //     tokens = await Token.findByUserAddress(address);
  //   } catch (error) {
  //     logger.error(error);
  //     return res.status(500).end();
  //   }

  //   if (!tokens || tokens.length === 0) {
  //     res.status(200).send({ address, results: [] });
  //     return;
  //   }

  //   let results;
  //   try {
  //     // For each token, retrieve the associated web 2 account & reputation
  //     results = await Promise.all(
  //       tokens.map(async (token) => {
  //         return await getReputationFromToken(token);
  //       })
  //     );
  //   } catch (error) {
  //     logger.error(error);
  //     return res.status(500).end();
  //   }

  //   res.status(200).send({ address, results });
  // };

  public getTokensByAddress = async (
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<{
    tokens: ITokenDocument[];
  } | void> => {
    try {
      const owner = req.query.owner;
      if (!owner || typeof owner !== "string") {
        return res.status(400).end();
      }
      const ownerChecksummedAddress = getChecksummedAddress(owner);

      if (!ownerChecksummedAddress)
        return res.status(400).send("Invalid address");

      const tokens = await Token.findByUserAddress(ownerChecksummedAddress);

      if (!tokens) return res.status(200).send({ tokens: [] });

      await checkAndUpdateTokenStatus(tokens);

      const tokensAsJSON = tokens.map((token) => token.toJSON());

      return res.status(200).send({ tokens: tokensAsJSON });
    } catch (err) {
      logger.error(err);
      return res.status(500).end();
    }
  };

  public mintToken = async (
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<{
    tokens: ITokenDocument[];
  } | void> => {
    const { tokenId } = JSON.parse(req.body);

    if (!tokenId) return res.status(400).end();

    try {
      const txResponse = await mintToken(tokenId);

      return res.status(200).send(txResponse);
    } catch (error) {
      logger.error(error);
      return res.status(400).send({ error: error.message });
    }
  };
}

export default new TokenController();
