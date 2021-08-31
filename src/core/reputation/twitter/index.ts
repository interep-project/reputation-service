import { ITwitterAccountDocument } from "src/models/web2Accounts/twitter/TwitterAccount.types";
import TwitterAccount from "src/models/web2Accounts/twitter/TwitterAccount.model";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import {
  AccountReputationByAccount,
  BasicReputation,
  Web2Providers,
} from "src/models/web2Accounts/Web2Account.types";
import {
  getTwitterUserById,
  getTwitterUserByUsername,
} from "src/services/twitter";
import { TwitterUser } from "src/types/twitter";
import { instantiateNewTwitterAccount } from "src/utils/server/createNewTwitterAccount";
import logger from "src/utils/server/logger";
import { checkBasicTwitterUserReputation } from "./basicChecks";
import getBotometerScores from "./botometer/getBotometerScores";

const getTwitterAccountReputationPayload = (
  account: ITwitterAccountDocument
): AccountReputationByAccount => ({
  provider: Web2Providers.TWITTER,
  user: account.user,
  basicReputation: account.basicReputation,
  botometer: account.botometer,
});

export const getTwitterUserReputation = async ({
  twitterAccount,
  twitterUser,
}: {
  twitterAccount: ITwitterAccountDocument | null;
  twitterUser: TwitterUser;
}): Promise<AccountReputationByAccount | null> => {
  const twitterReputation = checkBasicTwitterUserReputation(twitterUser);

  if (!twitterAccount) {
    twitterAccount = instantiateNewTwitterAccount({
      providerAccountId: twitterUser.id,
      user: twitterUser,
      basicReputation: twitterReputation,
      isLinkedToAddress: false,
    });
    // update existing twitter account
  } else {
    twitterAccount.user = { ...twitterAccount.user, ...twitterUser };
    twitterAccount.basicReputation = twitterReputation;
  }

  try {
    await twitterAccount.save();
  } catch (err) {
    logger.error(err);
    return null;
  }

  if (
    twitterReputation === BasicReputation.CONFIRMED ||
    twitterReputation === BasicReputation.NOT_SUFFICIENT
  ) {
    return getTwitterAccountReputationPayload(twitterAccount);
  }

  // Further checks needed: query botometer
  const botometerData = await getBotometerScores(twitterAccount.user.username);

  if (botometerData) {
    twitterAccount.botometer = botometerData;

    // Botometer overall display score =< 1 gets you a CONFIRMED reputation
    if (
      twitterAccount.botometer.display_scores &&
      twitterAccount.botometer.display_scores.universal.overall <= 1
    ) {
      twitterAccount.basicReputation = BasicReputation.CONFIRMED;
    }

    await twitterAccount.save();

    return getTwitterAccountReputationPayload(twitterAccount);
  }

  return null;
};

export const checkTwitterReputationById = async (
  twitterAccountId: string
): Promise<AccountReputationByAccount | null> => {
  // Check if account is in database already
  const twitterAccount: ITwitterAccountDocument | null = (await Web2Account.findByProviderAccountId(
    Web2Providers.TWITTER,
    twitterAccountId
  )) as ITwitterAccountDocument;

  if (twitterAccount?.basicReputation) {
    return getTwitterAccountReputationPayload(twitterAccount);
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

  return getTwitterUserReputation({ twitterAccount, twitterUser });
};

export const checkTwitterReputationByUsername = async (
  username: string
): Promise<AccountReputationByAccount | null> => {
  // Check if account is in database already
  const twitterAccount: ITwitterAccountDocument | null = await TwitterAccount.findByTwitterUsername(
    username
  );

  if (twitterAccount?.basicReputation) {
    return getTwitterAccountReputationPayload(twitterAccount);
  }

  // Query Twitter for user data
  let twitterUser: TwitterUser;
  try {
    twitterUser = await getTwitterUserByUsername({
      username: username,
    });
  } catch (err) {
    logger.error(err);
    return null;
  }
  // Failed to get Twitter data: Abort.
  if (!twitterUser) {
    return null;
  }

  return getTwitterUserReputation({ twitterAccount, twitterUser });
};
