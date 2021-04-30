import { ITwitterAccountDocument } from "src/models/web2Accounts/twitter/TwitterAccount.types";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import {
  AccountReputationByAccount,
  BasicReputation,
  Web2Providers,
} from "src/models/web2Accounts/Web2Account.types";
import { getTwitterUserById } from "src/services/twitter";
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

// TODO: split it, could accept web2AccountId directly
export const checkTwitterReputation = async (
  twitterAccountId: string
): Promise<AccountReputationByAccount | null> => {
  // Check if account is in database already
  let twitterAccount: ITwitterAccountDocument | null = (await Web2Account.findByProviderAccountId(
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
    await twitterAccount.save();

    return getTwitterAccountReputationPayload(twitterAccount);
  }

  return null;
};
