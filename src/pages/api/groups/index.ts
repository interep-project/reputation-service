import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { withSentry } from "@sentry/nextjs";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";
import Group from "src/models/groups/Group.model";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<any> => {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    const groups = await Group.findGroups();

    if (!groups) {
      return res.status(200).send([]);
    }

    const filteredGroups = groups.map((group) => ({
      groupId: group.groupId,
      description: group.description,
    }));

    return res.status(200).send(filteredGroups);
  } catch (error) {
    logger.error(error);
    return res.status(500).end();
  }
};

export default withSentry(handler as NextApiHandler);
