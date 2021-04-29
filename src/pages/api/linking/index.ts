import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import linkAccounts from "src/core/linking";
import Token from "src/models/tokens/Token.model";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method !== "PUT") {
    res.status(405).end();
    return;
  }

  const session = await getSession({ req });
  if (!session) {
    res.status(401).end();
    return;
  }

  const { address, web2AccountId, signature } = req.body;

  // logger.silly(
  //   `Linking ${address} with ${web2AccountId}. Signature: ${signature}`
  // );

  // Invalid call
  if (!address || !web2AccountId || !signature) {
    res.status(400).end();
    return;
  }

  try {
    const token = await linkAccounts({ address, web2AccountId, signature });
    return token instanceof Token
      ? res.status(200).end()
      : res.status(500).end();
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ error });
  }
};
