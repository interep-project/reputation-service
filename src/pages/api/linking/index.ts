import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import linkAccounts from "src/core/linking";
import Token from "src/models/tokens/Token.model";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method !== "PUT") {
    return res.status(405).end();
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).end();
  }
  const { address, web2AccountId, signature } = JSON.parse(req.body);

  // logger.silly(
  //   `Linking ${address} with ${web2AccountId}. Signature: ${signature}`
  // );

  // Invalid call
  if (!address || !web2AccountId || !signature) {
    return res.status(400).end();
  }

  // Check if user is connected with the web 2 account to be linked
  if (session.web2AccountId !== web2AccountId) {
    return res.status(403).end();
  }

  try {
    const attestation = await linkAccounts({
      address,
      web2AccountId,
      signature,
    });

    return attestation.backendSignature
      ? res.status(201).send({ status: "ok", attestation })
      : res.status(500).end();
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ error: error.message });
  }
};
