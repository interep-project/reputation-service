import type { NextApiRequest, NextApiResponse } from "next";
import TokenController from "src/controllers/TokenController";
import { ITokenDocument } from "src/models/tokens/Token.types";
import { dbConnect } from "src/utils/server/database";

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ tokens: Partial<ITokenDocument[]> } | void> => {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).end();
  } else {
    return TokenController.mintToken(req, res);
  }
};
