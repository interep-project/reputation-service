import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "next-auth/jwt";
import config from "src/config";
import Token from "src/models/tokens/Token.model";
import { TokenStatus } from "src/models/tokens/Token.types";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import { JWToken } from "src/types/nextAuth/token";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";

// TODO: update after token schema change
export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  await dbConnect();

  try {
    // @ts-ignore: secret exists
    const token: JWToken = await jwt.getToken({
      req,
      secret: config.JWT_SECRET,
    });

    // get web2acountId
    const web2AccountId = token.web2AccountId;

    if (!web2AccountId) {
      return res.status(403).end();
    }

    const web2Account = await Web2Account.findById(web2AccountId);

    if (!web2Account) {
      return res.status(400).send("Unable to find web 2 account");
    }

    if (!web2Account.isLinkedToAddress) {
      return res.status(200).send("Web 2 account is not linked");
    }

    // Get tokens associated with the web2Account id
    const tokensAssociatedWithWeb2account = await Token.find({
      web2Account: web2AccountId,
    });

    const areAllTokensBurned = tokensAssociatedWithWeb2account?.every(
      (token) => token.status === TokenStatus.BURNED
    );

    if (areAllTokensBurned) {
      web2Account.isLinkedToAddress = false;
      await web2Account.save();

      return res.status(200).send("Accounts were successfully un-linked");
    } else {
      return res
        .status(200)
        .send(
          "The on-chain token associated with the web 2 account you are connected with needs to be burned first."
        );
    }
  } catch (err) {
    logger.error(err);
    return res.status(500).end();
  }
};
