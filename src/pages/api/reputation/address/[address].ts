import type { NextApiRequest, NextApiResponse } from "next";
import TokenController from "src/controllers/TokenController";
import { dbConnect } from "src/utils/server/database";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === "GET") {
    return TokenController.getReputationByAddress(req, res);
  } else {
    res.status(405).end();
  }
};
