import { NextApiRequest, NextApiResponse } from "next";
import jwt from "next-auth/jwt";
// import { normalizeBotometerData } from "src/normalizers/botometer";
// import { getBotScore } from "src/services/botometer";
import { checkTwitterReputation } from "src/core/reputation/twitter";
import config from "src/config";
import { JWToken } from "src/types/nextAuth/token";
import { TwitterReputation } from "src/models/web2Accounts/twitter/TwitterAccount.types";

class UserController {
  public getTwitterReputation = async (
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<TwitterReputation | undefined> => {
    if (!req.query.id || typeof req.query.id !== "string") {
      res.status(400).end();
      return;
    }

    const twitterReputation = await checkTwitterReputation(req.query.id);

    if (twitterReputation) {
      res.status(200).send(twitterReputation);
    } else {
      res.status(500).end();
      return;
    }
  };

  public getMyTwitterReputation = async (
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<TwitterReputation | undefined> => {
    // @ts-ignore: accepts secret
    const token: JWToken = await jwt.getToken({
      req,
      secret: config.JWT_SECRET,
    });

    if (!token) {
      // Not Signed in
      res.status(401).end();
      return;
    }

    if (!token?.twitter?.userId) {
      res.status(401).end();
      return;
    }

    const twitterReputation = await checkTwitterReputation(
      token.twitter.userId
    );

    if (twitterReputation) {
      res.status(200).send(twitterReputation);
    } else {
      res.status(500).end();
      return;
    }

    res.end();
  };

  // public getBotScore = async (req: NextApiRequest, res: NextApiResponse) => {
  //   if (!req.query.username || typeof req.query.username !== "string") {
  //     res.status(400).end();
  //     return;
  //   }

  //   const username = req.query.username.toLowerCase();
  //   let user = await User.findByTwitterUsername(username);

  //   if (!user) {
  //     user = await new User({ twitter: { username } }).save();
  //   }

  //   if (user.twitter.botometer?.raw_scores?.universal?.overall) {
  //     res.status(200).send(user.twitter.botometer);
  //     return;
  //   }

  //   let botometerResponse = null;
  //   try {
  //     botometerResponse = await getBotScore(username);
  //   } catch (err) {
  //     res.status(500).end();
  //     return;
  //   }

  //   if (!botometerResponse) {
  //     res.status(500).end();
  //     return;
  //   }

  //   const botometerData = normalizeBotometerData(botometerResponse);

  //   if (botometerData.twitterData && botometerData.botometer) {
  //     user.twitter = { ...user.twitter, ...botometerData.twitterData };
  //     await user.save();

  //     user.twitter.botometer = botometerData.botometer;
  //     await user.save();

  //     res.send(user.twitter.botometer);
  //   } else {
  //     res.status(500).end();
  //     return;
  //   }
  // };
}

export default new UserController();
