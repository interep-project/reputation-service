import { NextApiRequest, NextApiResponse } from "next";
import User from "src/models/users/User.model";
import { normalizeBotometerData } from "src/normalizers/botometer";
import { getBotScore } from "src/services/botometer";
import { checkTwitterReputation } from "src/core/verification/twitter";
import { IUser } from "src/models/users/User.types";

class UserController {
  public getTwitterReputation = async (
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<IUser["twitter"] | undefined> => {
    if (!req.query.username || typeof req.query.username !== "string") {
      res.status(400).end();
      return;
    }
    const username = req.query.username.toLowerCase();

    const user = await checkTwitterReputation(username);

    if (user?.twitter?.reputation) {
      res.status(200).send(user.twitter);
    } else {
      res.status(500).end();
      return;
    }
  };

  public getBotScore = async (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.query.username || typeof req.query.username !== "string") {
      res.status(400).end();
      return;
    }

    const username = req.query.username.toLowerCase();
    let user = await User.findByTwitterUsername(username);

    if (!user) {
      user = await new User({ twitter: { username } }).save();
    }

    if (user.twitter.botometer?.raw_scores?.universal?.overall) {
      res.status(200).send(user.twitter.botometer);
      return;
    }

    let botometerResponse = null;
    try {
      botometerResponse = await getBotScore(username);
    } catch (err) {
      res.status(500).end();
      return;
    }

    if (!botometerResponse) {
      res.status(500).end();
      return;
    }

    const botometerData = normalizeBotometerData(botometerResponse);

    if (botometerData.twitterData && botometerData.botometer) {
      user.twitter = { ...user.twitter, ...botometerData.twitterData };
      await user.save();

      user.twitter.botometer = botometerData.botometer;
      await user.save();

      res.send(user.twitter.botometer);
    } else {
      res.status(500).end();
      return;
    }
  };
}

export default new UserController();
