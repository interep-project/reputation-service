import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { withSentry } from "@sentry/nextjs";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";
import Group from "src/models/groups/Group.model";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const groups = await Group.findGroups();

      if (!groups) {
        return res.status(200).send({ tokens: [] });
      }

      return res.status(200).send(groups);
    } catch (error) {
      logger.error(error);
      return res.status(500).end();
    }
  } else {
    res.status(405).end();
  }
};

export default withSentry(handler as NextApiHandler);
