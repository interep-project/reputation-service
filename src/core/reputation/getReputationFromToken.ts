import { ITokenDocument } from "src/models/tokens/Token.types";
import { ITwitterAccount } from "src/models/web2Accounts/twitter/TwitterAccount.types";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import {
  AccountReputation,
  isTwitterAccount,
  Web2Providers,
} from "src/models/web2Accounts/Web2Account.types";
import logger from "src/utils/server/logger";

const getReputationFromToken = async (
  token: ITokenDocument
): Promise<AccountReputation | null> => {
  const web2Account = await Web2Account.findById(token.web2Account);

  if (!web2Account) {
    logger.error(`No web 2 account associated with token ${token.id}`);
    return null;
  }

  if (isTwitterAccount(web2Account)) {
    return {
      provider: Web2Providers.TWITTER,
      reputation: (web2Account as ITwitterAccount).reputation || undefined,
      botometer: web2Account.botometer || undefined,
    };
  }
  return null;
};

export default getReputationFromToken;
