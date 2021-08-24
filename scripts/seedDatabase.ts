/* eslint no-console: 0 */
import { dbConnect, dbDisconnect } from "src/utils/server/database";
import seedTwitterUsers from "./seedTwitterUsers";
import seedGroups from './seedGroups';
import { TwitterUser } from "src/types/twitter";
import {
  getTwitterFriendsByUserId,
  getTwitterUserByUsername,
} from "src/services/twitter";
import { findByTwitterUsername } from "src/models/web2Accounts/twitter/utils";
import TwitterAccount from "src/models/web2Accounts/twitter/TwitterAccount.model";
import { createTwitterAccountObject } from "src/utils/server/createNewTwitterAccount";
import { BasicReputation } from "src/models/web2Accounts/Web2Account.types";
import Group from "src/models/groups/Group.model";

const createTwitterSeedUser = (twitterUser: TwitterUser) => ({
  providerAccountId: twitterUser.id,
  user: twitterUser,
  isSeedUser: true,
  isLinkedToAddress: false,
  basicReputation: BasicReputation.CONFIRMED,
});

(async () => {
  dbConnect();

  try {
    // Seed twitter users
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

    // Seed groups
    for (const group of seedGroups) {
      console.log(`######## Processing group ${group.groupId} #########`);
      let groupDoc = await Group.findByGroupId(group.groupId);

      // Already in DB?
      if (groupDoc) return;

      groupDoc = await Group.create(group);
      
      //
      try {
        console.log("Inserting in DB...");
        await groupDoc.save();
        console.log(`Inserted new group with ID ${groupDoc.id}`);
      } catch (error) {
        console.log(`Error inserting group: ${error}`);
      }      
    }

    // Seed the merkle tree zeroes
    // TODO

    dbDisconnect();
  } catch (e) {
    console.error(e);
  }
})();
