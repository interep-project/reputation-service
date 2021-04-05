import User from "src/models/users/User.model";
import { IUserDocument } from "src/models/users/User.types";
import { getTwitterUserByUsername } from "src/services/twitter";
import { BasicTwitterReputation } from "src/types/twitter";
import { checkBasicTwitterUserReputation } from "./basicChecks";

const checkTwitterReputation = async (
  username: string
): Promise<IUserDocument | null> => {
  // Check if user in database already
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
    // eslint-disable-next-line no-console
    console.error(err);
    return null;
  }

  if (!twitterUser) {
    return null;
  }

  // Check Twitter User Reputation
  const twitterReputation = checkBasicTwitterUserReputation(twitterUser);

  user.twitter = { user: twitterUser, reputation: twitterReputation };
  try {
    await user.save();
  } catch (err) {
    console.log(err);
    return null;
  }

  if (twitterReputation === BasicTwitterReputation.UNCLEAR) {
    // Get bot score
    return null;
  } else {
    return user;
  }
};

export default checkTwitterReputation;
