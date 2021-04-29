import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { createAssociationMessage } from "src/core/linking/signature";
import Token from "src/models/tokens/Token.model";
import { getChecksummedAddress } from "src/utils/crypto/address";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === "PUT") {
    console.log(`req.body`, req.body);
    const session = await getSession({ req });
    if (!session) {
      res.status(401).end();
      return;
    }

    const { address, web2AccountId, signature } = JSON.parse(req.body);

    // Invalid call
    if (
      !address ||
      !web2AccountId ||
      !signature ||
      session.web2AccountId !== web2AccountId
    ) {
      res.status(400).end();
      return;
    }

    const checksummedAddress = getChecksummedAddress(address);

    // Invalid address
    if (!checksummedAddress) {
      res.status(400).end();
      return;
    }

    // Web 2 Account already linked
    const isWeb2AccountAlreadyLinked = await Token.exists({
      web2Account: web2AccountId,
    });

    if (isWeb2AccountAlreadyLinked) {
      res.status(403).end();
      return;
    }

    const recreatedMessage = createAssociationMessage({
      address,
      web2AccountId: session.web2AccountId,
    });
    const signerAddress = ethers.utils.verifyMessage(
      recreatedMessage,
      signature
    );
    console.log(`signerAdd`, signerAddress);

    // Invalid signature
    if (signerAddress !== checksummedAddress) {
      res.status(400).end();
      return;
    }

    try {
      const token = await Token.create({
        userAddress: checksummedAddress,
        web2Account: web2AccountId,
        issuanceTimestamp: Date.now(),
      });
      res.status(200).send(token);
    } catch (error) {
      logger.error(error);
    }
  } else {
    res.status(405).end();
    return;
  }
};
