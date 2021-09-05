import colors from "colors";
import { TwitterUser } from "src/types/twitter";
import {
  getTwitterFriendsByUserId,
  getTwitterUserByUsername,
} from "src/services/twitter";
import TwitterAccount from "src/models/web2Accounts/twitter/TwitterAccount.model";
import { createTwitterAccountObject } from "src/utils/server/createNewTwitterAccount";
import { BasicReputation } from "src/models/web2Accounts/Web2Account.types";

export default async function seedTwitterUsers(
  twitterUsernames: string[],
  logger = false
): Promise<void> {
  const log = logger ? console.log : (message: string) => message;

  log(colors.white.bold("\nSeeding Twitter accounts...\n"));

  for (const username of twitterUsernames) {
    const twitterUser = await getTwitterUserByUsername({
      username,
    });
    const friends = await getTwitterFriendsByUserId({
      userId: twitterUser.id,
      maxResults: 900,
    });

    log(colors.white(`${username} has ${friends.length} friends`));

    if (friends.length === 0) {
      break;
    }

    const formattedFriends = friends.map((friend) =>
      createTwitterAccountObject(createTwitterSeedUser(friend))
    );

    try {
      // With ordered false, it inserts all documents it can and report
      // errors at the end (incl. errors from duplicates).
      const docs = await TwitterAccount.insertMany(formattedFriends, {
        ordered: false,
      });

      log(colors.green.bold(`${docs.length} ${username}'s friends inserted ✓`));
    } catch (error) {
      log(
        colors.white(`${error.result?.nInserted} documents have been inserted`)
      );
      log(colors.white(`Number of write errors: ${error.writeErrors?.length}`));
    }

    log("\n");
  }
}

function createTwitterSeedUser(twitterUser: TwitterUser): any {
  return {
    providerAccountId: twitterUser.id,
    user: twitterUser,
    isSeedUser: true,
    isLinkedToAddress: false,
    basicReputation: BasicReputation.CONFIRMED,
  };
}
