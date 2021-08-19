import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { withSentry } from "@sentry/nextjs";
import { getSession } from "next-auth/client";
import addSemaphoreIdentity from "src/core/groups";
import { dbConnect } from "src/utils/server/database";
import logger from "src/utils/server/logger";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ isLinkedToAddress: boolean } | void | { error: string }> => {
  await dbConnect();

  if (req.method !== "PUT") {
    return res.status(405).end();
  }

  const session = await getSession({ req });

  if (!session) {
    return res.status(401).end();
  }

  const groupId = req.query?.groupId;
  const { semaphoreIdentity, web2AccountId } = JSON.parse(req.body);

  if (
    !semaphoreIdentity ||
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
      `Adding Semaphore identity ${semaphoreIdentity} to the group ${groupId}`
    );

    await addSemaphoreIdentity({
      groupId,
      web2AccountId,
      semaphoreIdentity,
    });

    res.status(201).send({ status: "ok" });
  } catch (error) {
    logger.error(error);

    return res.status(400).end();
  }
};

export default withSentry(handler as NextApiHandler);
