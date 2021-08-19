import Web2Account from "src/models/web2Accounts/Web2Account.model";
import logger from "src/utils/server/logger";

type FunctionParameters = {
  groupId: string;
  web2AccountId: string;
  semaphoreIdentity: string;
};

const addSemaphoreIdentity = async ({
  groupId,
  web2AccountId,
  semaphoreIdentity,
}: FunctionParameters): Promise<void> => {
  let web2Account;

  try {
    web2Account = await Web2Account.findById(web2AccountId);
  } catch (error) {
    logger.error(error);
    throw new Error(`Error retrieving web 2 account`);
  }

  if (!web2Account) {
    throw new Error(`Web 2 account not found`);
  }

  if (
    !web2Account.basicReputation ||
    `TWITTER_${web2Account.basicReputation}` !== groupId
  ) {
    throw new Error(`The group id does not match the web 2 account reputation`);
  }

  console.log(semaphoreIdentity);
};

export default addSemaphoreIdentity;
