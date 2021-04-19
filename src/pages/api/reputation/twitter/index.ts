import type { NextApiRequest, NextApiResponse } from "next";
import UserController from "src/controllers/UserController";
import { dbConnect } from "src/utils/server/database";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === "GET") {
    return UserController.getMyTwitterReputation(req, res);
  } else {
    res.status(405).end();
  }
};
