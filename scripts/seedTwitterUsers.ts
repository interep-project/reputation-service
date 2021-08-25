import { dbConnect, dbDisconnect } from "src/utils/server/database";
import { TwitterUser } from "src/types/twitter";
import {
  getTwitterFriendsByUserId,
  getTwitterUserByUsername,
} from "src/services/twitter";
import TwitterAccount from "src/models/web2Accounts/twitter/TwitterAccount.model";
import { createTwitterAccountObject } from "src/utils/server/createNewTwitterAccount";
import { BasicReputation } from "src/models/web2Accounts/Web2Account.types";
import colors from "colors";

const twitterUsernames = [
  // "twobitidiot",
  // "La__Cuen", 10k+ friends
  // "VitalikButerin",
  // "FEhrsam",
  "byrongibson",
  "arcalinea",
  // "kumavis_",
  // "whyrusleeping",
  // "juanbenet",
  // "karl_dot_tech",
  // "jinglanW",
  // "jillruthcarlson",
  // "zmanian", 10k+ friends
  // "notscottmoore",
  // "RaphaelRoullet",
  // "nicksdjohnson",
  // "emilianobonassi",
  // "kaiynne",
  // "RuneKek",
  // "haydenzadams",
  // "sassal0x",
  // "drakefjustin",
];

async function main(): Promise<void> {
  console.log(colors.white.bold("\nSeeding Twitter accounts...\n"));

  for (const username of twitterUsernames) {
    const twitterUser = await getTwitterUserByUsername({
      username,
    });
    const friends = await getTwitterFriendsByUserId({
      userId: twitterUser.id,
      maxResults: 900,
    });

    console.log(colors.white(`${username} has ${friends.length} friends`));

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

      console.log(
        colors.green.bold(`${docs.length} ${username}'s friends inserted ✓`)
      );
    } catch (error) {
      console.log(
        colors.white(`${error.result?.nInserted} documents have been inserted`)
      );
      console.log(
        colors.white(`Number of write errors: ${error.writeErrors?.length}`)
      );
    }

    console.log("/n");
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

(async () => {
  dbConnect();

  try {
    await main();
    dbDisconnect();

    process.exit(0);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
})();
