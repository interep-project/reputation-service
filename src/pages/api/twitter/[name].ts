import type { NextApiRequest, NextApiResponse } from "next";
import User from "src/models/users/User.model";
import { dbConnect } from "src/utils/server/database";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (!req.query.name || typeof req.query.name !== "string") {
    res.status(400);
  }
  const user = await User.findByTwitterName(req.query.name as string);

  res.status(200).json({ twitter: user?.twitter });
};
