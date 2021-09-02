import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { withSentry } from "@sentry/nextjs";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";
import { MerkleTreeNode } from "src/models/merkleTree/MerkleTree.model";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const identityCommitment = req.query?.identityCommitment;

  if (!identityCommitment || typeof identityCommitment !== "string") {
    return res.status(400).end();
  }

  try {
    const node = await MerkleTreeNode.findByHash(identityCommitment);

    return res.status(200).send({ data: !!node });
  } catch (error) {
    logger.error(error);

    return res.status(500).end();
  }
};

export default withSentry(handler as NextApiHandler);
