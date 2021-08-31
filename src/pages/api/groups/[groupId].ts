import { withSentry } from "@sentry/nextjs";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import MerkleTreeController from "src/controllers/MerkleTreeController";
import { getInterRepGroupsContractInstance } from "src/core/blockchain/InterRepGroups/InterRepGroupsContract";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import { dbConnect } from "src/utils/server/database";
import { ethers } from "hardhat";
import logger from "src/utils/server/logger";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  await dbConnect();

  if (req.method !== "POST") {
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
    const web2Account = await Web2Account.findById(web2AccountId);

    if (!web2Account) {
      throw new Error(`Web 2 account not found`);
    }

    if (
      !web2Account.basicReputation ||
      `TWITTER_${web2Account.basicReputation}` !== groupId
    ) {
      throw new Error(
        "The group id does not match the web 2 account reputation"
      );
    }

    logger.silly(
      `Adding identity commitment ${identityCommitment} to the tree of the group ${groupId}`
    );

    const rootHash = await MerkleTreeController.appendLeaf(
      groupId,
      identityCommitment
    );

    // Update contract with new root.
    const interRepGroups = await getInterRepGroupsContractInstance();

    await interRepGroups.addRootHash(
      ethers.utils.formatBytes32String(groupId),
      identityCommitment,
      rootHash
    );

    return res.status(201).send(rootHash);
  } catch (error) {
    logger.error(error);

    return res.status(500).end();
  }
};

export default withSentry(handler as NextApiHandler);
