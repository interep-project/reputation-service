import type { NextApiRequest, NextApiResponse } from "next";
import checkAndUpdateTokenStatus from "src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus";
import Token from "src/models/tokens/Token.model";
import { ITokenDocument } from "src/models/tokens/Token.types";
import { getChecksummedAddress } from "src/utils/crypto/address";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ tokens: Partial<ITokenDocument[]> } | void> => {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).end();
  }
  try {
    const owner = req.query.owner;
    if (!owner || typeof owner !== "string") {
      return res.status(400).end();
    }
    const ownerChecksummedAddress = getChecksummedAddress(owner);

    if (!ownerChecksummedAddress) return res.status(200).send({ tokens: [] });

    const tokens = await Token.findByUserAddress(ownerChecksummedAddress);

    if (!tokens) return res.status(200).send({ tokens: [] });

    await checkAndUpdateTokenStatus(tokens);

    return res.status(200).send({ tokens });
  } catch (err) {
    logger.error(err);
    return res.status(500).end();
  }
};
