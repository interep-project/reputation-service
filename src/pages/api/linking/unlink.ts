import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { withSentry } from "@sentry/nextjs";
import jwt from "next-auth/jwt";
import config from "src/config";
import unlinkAccounts from "src/core/linking/unlink";
import { JWToken } from "src/types/nextAuth/token";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  await dbConnect();
  let jwToken: JWToken;
  try {
    // @ts-ignore: secret exists
    jwToken = await jwt.getToken({
      req,
      secret: config.JWT_SECRET,
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).end();
  }

  // get web2acountId
  const web2AccountIdFromSession = jwToken?.web2AccountId;

  if (!web2AccountIdFromSession) {
    return res.status(403).send({
      success: false,
      error: "No web 2 account id from session. User might not be logged in.",
    });
  }
  const { decryptedAttestation } = JSON.parse(req.body);
  try {
    const result = await unlinkAccounts({
      web2AccountIdFromSession,
      decryptedAttestation,
    });

    if (result.success) {
      return res.status(200).send(result);
    } else {
      if (result.error) logger.error(result.error);
      return res.status(400).send(result);
    }
  } catch (err) {
    logger.error(err);
    return res.status(500).end();
  }
};

export default withSentry(handler as NextApiHandler);
