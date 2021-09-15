import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { withSentry } from "@sentry/nextjs";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";
import getGroupIds from "src/core/groups/getGroupIds";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    const groupIds = getGroupIds();

    return res.status(200).send({ data: groupIds });
  } catch (error) {
    logger.error(error);

    return res.status(500).end();
  }
};

export default withSentry(handler as NextApiHandler);
