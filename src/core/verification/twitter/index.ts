import User from "src/models/users/User.model";
import { IUserDocument } from "src/models/users/User.types";
import { getTwitterUserByUsername } from "src/services/twitter";
import { BasicTwitterReputation } from "src/types/twitter";
import logger from "src/utils/server/logger";
import { checkBasicTwitterUserReputation } from "./basicChecks";
import getBotometerScores from "./botometer/getBotometerScores";

export const checkTwitterReputation = async (
  username: string
): Promise<IUserDocument | null> => {
  // Check if user is in database already
  let user = await User.findByTwitterUsername(username);

  if (!user) {
    user = new User({ twitter: { username } });
  } else if (user.twitter?.reputation) {
    return user;
  }

  // Query Twitter for user data
  let twitterUser;
  try {
    twitterUser = await getTwitterUserByUsername({
      username,
    });
  } catch (err) {
    logger.error(err);
    return null;
  }
  // Failed to get Twitter data: Abort.
  if (!twitterUser) {
    return null;
  }

  const twitterReputation = checkBasicTwitterUserReputation(twitterUser);

  user.twitter = {
    user: { ...user.twitter?.user, ...twitterUser },
    reputation: twitterReputation,
  };
  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return null;
  }

  if (
    twitterReputation === BasicTwitterReputation.CONFIRMED ||
    twitterReputation === BasicTwitterReputation.NOT_SUFFICIENT
  ) {
    return user;
  }

  // Further checks needed: query botometer
  const botometerData = await getBotometerScores(username);

  if (botometerData) {
    user.twitter.botometer = botometerData;
    await user.save();

    return user;
  }

  return null;
};
