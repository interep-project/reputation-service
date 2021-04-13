import User from "src/models/users/User.model";
import { NextAuthTwitterAccount } from "src/types/nextAuth/twitter";
import { dbConnect } from "src/utils/server/database";

const handleSignIn = async (account: NextAuthTwitterAccount) => {
  await dbConnect();

  if (!account.id || !account.results.screen_name) {
    throw new Error("Invalid account response");
  }

  let user;

  try {
    user = await User.findByTwitterUsername(account.results.screen_name);
  } catch (error) {
    console.error(error);
  }

  if (!user) {
    user = new User({
      twitter: {
        user: {
          id: account.results.user_id,
          username: account.results.screen_name,
        },
      },
    });
  }

  user.twitter.refreshToken = account.refreshToken;

  await user.save();

  return true;
};

export default handleSignIn;
