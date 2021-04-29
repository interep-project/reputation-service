import { NextApiRequest, NextApiResponse } from "next";
import getReputationFromToken from "src/core/reputation/getReputationFromToken";
import Token from "src/models/tokens/Token.model";
import { ITokenDocument } from "src/models/tokens/Token.types";
import { AccountReputation } from "src/models/web2Accounts/Web2Account.types";
import { getChecksummedAddress } from "src/utils/crypto/address";
import logger from "src/utils/server/logger";

class TokenController {
  public getReputationByAddress = async (
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<{ address: string; results: AccountReputation[] } | undefined> => {
    if (!req.query.address || typeof req.query.address !== "string") {
      res.status(400).end();
      return;
    }

    // check address
    const address = getChecksummedAddress(req.query.address);

    if (!address) {
      res.status(400).end();
      return;
    }

    // retrieve all tokens for this address
    let tokens: ITokenDocument[] | null;
    try {
      tokens = await Token.findByUserAddress(address);
    } catch (error) {
      logger.error(error);
      res.status(500).end();
      return;
    }

    if (!tokens || tokens.length === 0) {
      res.status(200).send({ address, results: [] });
      return;
    }

    let results;
    try {
      // For each token, retrieve the associated web 2 account & reputation
      results = await Promise.all(
        tokens.map(async (token) => {
          return await getReputationFromToken(token);
        })
      );
    } catch (error) {
      logger.error(error);
      res.status(500).end();
      return;
    }

    res.status(200).send({ address, results });
  };
}

export default new TokenController();
