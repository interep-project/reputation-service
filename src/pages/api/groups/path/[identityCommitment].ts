import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { withSentry } from "@sentry/nextjs";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";
import MerkleTreeController from "src/controllers/MerkleTreeController";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<any> => {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const identityCommitment = req.query?.identityCommitment;

  if (!identityCommitment || typeof identityCommitment !== "string") {
    return res.status(400).end();
  }

  try {
    const path = await MerkleTreeController.retrievePath(identityCommitment);

    if (!path) {
      return res.status(200).send([]);
    }

    return res.status(200).send(path);
  } catch (error) {
    logger.error(error);
    return res.status(500).end();
  }
};

export default withSentry(handler as NextApiHandler);
