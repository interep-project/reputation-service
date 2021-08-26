import Group from "src/models/groups/Group.model";
import colors from "colors";
import { TwitterUser } from "src/types/twitter";
import {
  getTwitterFriendsByUserId,
  getTwitterUserByUsername,
} from "src/services/twitter";
import TwitterAccount from "src/models/web2Accounts/twitter/TwitterAccount.model";
import { createTwitterAccountObject } from "src/utils/server/createNewTwitterAccount";
import { BasicReputation } from "src/models/web2Accounts/Web2Account.types";
import { zeroBytes32 } from "src/utils/crypto/constants";
import config from "src/config";
import { MerkleTreeZero } from "src/models/merkleTree/MerkleTree.model";
import mimcSpongeHash from "src/utils/crypto/hasher";

export async function seedGroups(groups: any[], logger = true): Promise<void> {
  const log = logger ? console.log : (message: string) => message;

  log(colors.white.bold("\nSeeding groups...\n"));

  for (const group of groups) {
    let groupDocument = await Group.findByGroupId(group.groupId);

    if (groupDocument) {
      log(
        colors.white(`Document with id: ${groupDocument.id} already inserted`)
      );
    } else {
      groupDocument = await Group.create(group);

      await groupDocument.save();

      log(colors.white(`Document with id: ${groupDocument.id} inserted`));
    }
  }

  log(colors.green.bold("\nDocuments inserted correctly ✓\n"));
}

export async function seedZeroHashes(logger = true): Promise<void> {
  const log = logger ? console.log : (message: string) => message;

  log(colors.white.bold("\nSeeding zero hashes...\n"));

  let level = 0;
  let zeroHash = zeroBytes32;

  const zeroHashes = await MerkleTreeZero.findZeroes();

  if (zeroHashes && zeroHashes.length > 0) {
    log(colors.white(`There are already ${zeroHashes.length} zero hashes!\n`));

    level = zeroHashes.length;
    zeroHash = zeroHashes[level - 1].hash;
  }

  if (level < config.TREE_LEVELS) {
    for (level; level < config.TREE_LEVELS; level++) {
      zeroHash = mimcSpongeHash(zeroHash, zeroHash);

      const zeroHashDocument = await MerkleTreeZero.create({
        level,
        hash: zeroHash,
      });

      await zeroHashDocument.save();

      log(colors.white(`Document with id: ${zeroHashDocument.id} inserted`));
    }

    log(colors.green.bold("\nDocuments inserted correctly ✓\n"));
  }
}

export async function seedTwitterUsers(
  twitterUsernames: string[],
  logger = true
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

    log("/n");
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
