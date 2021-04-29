import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { createAssociationMessage } from "src/core/linking/signature";
import Token from "src/models/tokens/Token.model";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import { getChecksummedAddress } from "src/utils/crypto/address";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === "PUT") {
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

    const web2Account = await Web2Account.findById(web2AccountId);

    // Web 2 account not found
    if (!web2Account) {
      res.status(400).end();
      return;
    }

    // Web 2 Account already linked
    if (web2Account.isLinkedToAddress) {
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

    // Invalid signature
    if (signerAddress !== checksummedAddress) {
      res.status(400).end();
      return;
    }

    try {
      web2Account.isLinkedToAddress = true;
      await web2Account.save();

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
