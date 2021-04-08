/* eslint no-console: 0 */
import User from "src/models/users/User.model";
import { dbConnect, dbDisconnect } from "src/utils/server/database";
import seedTwitterUsers from "./seedTwitterUsers";
import { BasicTwitterReputation, TwitterUser } from "src/types/twitter";
import {
  getTwitterFriendsByUserId,
  getTwitterUserByUsername,
} from "src/services/twitter";

const createTwitterSeedUserObject = (twitterUser: TwitterUser) => ({
  twitter: {
    isSeedUser: true,
    user: twitterUser,
    reputation: BasicTwitterReputation.CONFIRMED,
  },
});

(async () => {
  dbConnect();

  try {
    for (const handle of seedTwitterUsers) {
      let user = await User.findByTwitterUsername(handle);
      console.log(`######## Processing ${handle} #########`);
      console.log(`${handle} already in DB?`, !!user);

      if (!user) {
        const twitterUser = await getTwitterUserByUsername({
          username: handle,
        });
        const userObject = createTwitterSeedUserObject(twitterUser);
        user = await User.create(userObject);

        console.log(`Created user ${user.twitter.user?.username}`);
      }

      if (!user.twitter.user?.id) {
        console.log("Missing Twitter id for", handle);
        continue;
      }

      // Get users followed by seed user
      const friends: TwitterUser[] = await getTwitterFriendsByUserId({
        userId: user.twitter.user?.id,
        maxResults: 900,
      });

      console.log("Number of friends:", friends.length);

      if (friends.length === 0) return;

      const formattedFriends = friends.map(createTwitterSeedUserObject);

      try {
        console.log("Inserting in DB...");
        // with ordered false, it inserts all documents it can and report errors at the end (incl. errors from duplicates)
        const docs = await User.insertMany(formattedFriends, {
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
