import {
  ITwitterAccountDocument,
  TwitterReputation,
} from "src/models/web2Accounts/twitter/TwitterAccount.types";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import { Web2Providers } from "src/models/web2Accounts/Web2Account.types";
import { getTwitterUserById } from "src/services/twitter";
import { BasicTwitterReputation, TwitterUser } from "src/types/twitter";
import { createNewTwitterAccount } from "src/utils/server/createNewTwitterAccount";
import logger from "src/utils/server/logger";
import { checkBasicTwitterUserReputation } from "./basicChecks";
import getBotometerScores from "./botometer/getBotometerScores";

export const checkTwitterReputation = async (
  twitterAccountId: string
): Promise<TwitterReputation | null> => {
  // Check if account is in database already
  let twitterAccount: ITwitterAccountDocument | null = (await Web2Account.findByProviderAccountId(
    Web2Providers.TWITTER,
    twitterAccountId
  )) as ITwitterAccountDocument;

  if (twitterAccount?.reputation) {
    return {
      reputation: twitterAccount.reputation,
      botometer: twitterAccount.botometer,
    };
  }

  // Query Twitter for user data
  let twitterUser: TwitterUser;
  try {
    twitterUser = await getTwitterUserById({
      id: twitterAccountId,
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

  if (!twitterAccount) {
    // TODO: move that to util
    twitterAccount = createNewTwitterAccount({
      providerAccountId: twitterUser.id,
      user: twitterUser,
      reputation: twitterReputation,
    });
  } else {
    twitterAccount.user = { ...twitterAccount.user, ...twitterUser };
    twitterAccount.reputation = twitterReputation;
  }

  try {
    await twitterAccount.save();
  } catch (err) {
    logger.error(err);
    return null;
  }

  if (
    twitterReputation === BasicTwitterReputation.CONFIRMED ||
    twitterReputation === BasicTwitterReputation.NOT_SUFFICIENT
  ) {
    return {
      reputation: twitterAccount.reputation,
      botometer: twitterAccount.botometer,
    };
  }

  // Further checks needed: query botometer
  const botometerData = await getBotometerScores(twitterAccount.user.username);

  if (botometerData) {
    twitterAccount.botometer = botometerData;
    await twitterAccount.save();

    return {
      reputation: twitterAccount.reputation,
      botometer: twitterAccount.botometer,
    };
  }

  return null;
};
