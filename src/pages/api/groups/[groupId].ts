import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { withSentry } from "@sentry/nextjs";
import { getSession } from "next-auth/client";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import MerkleTreeController from "src/controllers/MerkleTreeController";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<any> => {
  await dbConnect();

  if (req.method !== "PUT") {
    return res.status(405).end();
  }

  const session = await getSession({ req });

  if (!session) {
    return res.status(401).end();
  }

  const groupId = req.query?.groupId;
  const { identityCommitment, web2AccountId } = JSON.parse(req.body);

  if (
    !identityCommitment ||
    !web2AccountId ||
    !groupId ||
    typeof groupId !== "string"
  ) {
    return res.status(400).end();
  }

  if (session.web2AccountId !== web2AccountId) {
    return res.status(403).end();
  }

  try {
    logger.silly(
      `Adding identity commitment ${identityCommitment} to the tree of the group ${groupId}`
    );

    let web2Account;

    try {
      web2Account = await Web2Account.findById(web2AccountId);
    } catch (error) {
      logger.error(error);
      throw new Error(`Error retrieving web 2 account`);
    }

    if (!web2Account) {
      throw new Error(`Web 2 account not found`);
    }

    if (
      !web2Account.basicReputation ||
      `TWITTER_${web2Account.basicReputation}` !== groupId
    ) {
      throw new Error(
        `The group id does not match the web 2 account reputation`
      );
    }

    await MerkleTreeController.appendLeaf(groupId, identityCommitment);

    return res.status(201).send({ status: "ok" });
  } catch (error) {
    logger.error(error);

    return res.status(400).end();
  }
};

export default withSentry(handler as NextApiHandler);
