import type { NextApiRequest, NextApiResponse } from "next";
import TwitterAccountController from "src/controllers/TwitterAccountController";
import { dbConnect } from "src/utils/server/database";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === "GET") {
    return TwitterAccountController.getTwitterReputation(req, res);
  } else {
    res.status(405).end();
  }
};
