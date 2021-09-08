import { withSentry } from "@sentry/nextjs";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import Group from "src/models/groups/Group.model";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const groupId = req.query?.groupId;

  if (!groupId || typeof groupId !== "string") {
    return res.status(400).end();
  }

  try {
    const group = await Group.findByGroupId(groupId);

    if (!group) {
      return res.status(400).end();
    }

    return res.status(200).send({
      data: {
        groupId: group.groupId,
        description: group.description,
      },
    });
  } catch (error) {
    logger.error(error);

    return res.status(500).end();
  }
};

export default withSentry(handler as NextApiHandler);
