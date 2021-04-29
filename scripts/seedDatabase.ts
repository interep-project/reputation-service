/* eslint no-console: 0 */
import { dbConnect, dbDisconnect } from "src/utils/server/database";
import seedTwitterUsers from "./seedTwitterUsers";
import { BasicTwitterReputation, TwitterUser } from "src/types/twitter";
import {
  getTwitterFriendsByUserId,
  getTwitterUserByUsername,
} from "src/services/twitter";
import { findByTwitterUsername } from "src/models/web2Accounts/twitter/utils";
import TwitterAccount from "src/models/web2Accounts/twitter/TwitterAccount.model";
import { createTwitterAccountObject } from "src/utils/server/createNewTwitterAccount";

const createTwitterSeedUser = (twitterUser: TwitterUser) => ({
  providerAccountId: twitterUser.id,
  user: twitterUser,
  isSeedUser: true,
  isLinkedToAddress: false,
  reputation: BasicTwitterReputation.CONFIRMED,
});

(async () => {
  dbConnect();

  try {
    for (const handle of seedTwitterUsers) {
      let twitterAccount = await findByTwitterUsername(handle);
      console.log(`######## Processing ${handle} #########`);
      console.log(`${handle} already in DB?`, !!twitterAccount);

      if (!twitterAccount) {
        const twitterUser = await getTwitterUserByUsername({
          username: handle,
        });
        twitterAccount = await TwitterAccount.create(
          createTwitterAccountObject(createTwitterSeedUser(twitterUser))
        );

        console.log(`Created user ${twitterAccount.user.username}`);
      }

      // Get users followed by seed user
      const friends: TwitterUser[] = await getTwitterFriendsByUserId({
        userId: twitterAccount.providerAccountId,
        maxResults: 900,
      });

      console.log("Number of friends:", friends.length);

      if (friends.length === 0) return;

      const formattedFriends = friends.map((friend) =>
        createTwitterAccountObject(createTwitterSeedUser(friend))
      );

      try {
        console.log("Inserting in DB...");
        // with ordered false, it inserts all documents it can and report errors at the end (incl. errors from duplicates)
        const docs = await TwitterAccount.insertMany(formattedFriends, {
          ordered: false,
        });
        console.log(`Inserted ${docs.length} new users without errors`);
      } catch (error) {
        console.log(`Number of inserted docs`, error.result?.nInserted);
        console.log("Number of write errors:", error.writeErrors?.length);
      }
    }
    dbDisconnect();
  } catch (e) {
    console.error(e);
  }
})();
