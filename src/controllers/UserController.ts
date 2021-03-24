import { NextApiRequest, NextApiResponse } from "next";
import User from "src/models/users/User.model";
import { normalizeBotometerData } from "src/normalizers/botometer";
import { getBotScore } from "src/services/botometer";

class UserController {
  public getBotScore = async (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.query.name || typeof req.query.name !== "string") {
      res.status(400).end();
      return;
    }

    const name = req.query.name.toLowerCase();
    let user = await User.findByTwitterName(name);

    if (!user) {
      user = await new User({ twitter: { name } }).save();
    }

    if (user.botometer?.raw_scores?.universal?.overall) {
      res.status(200).send(user.botometer);
      return;
    }

    let botometerResponse = null;
    try {
      botometerResponse = await getBotScore(name);
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }

    if (!botometerResponse) {
      res.status(500).end();
      return;
    }

    const botometerData = normalizeBotometerData(botometerResponse);

    user.twitter = { ...user.twitter, ...botometerData.twitterData };
    await user.save();

    user.botometer = botometerData.botometer;
    await user.save();

    res.send(user.botometer);
  };
}

export default new UserController();
