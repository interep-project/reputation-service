import { dbConnect, dbDisconnect } from "src/utils/server/database";
import Group from "src/models/groups/Group.model";
import colors from "colors";

const groups = [
  {
    groupId: "TWITTER_CONFIRMED",
    description: "Twitter users with more than 7000 followers",
  },
  {
    groupId: "TWITTER_UNCLEAR",
    description:
      "Twitter users with 2 < followers < 7000, some tweets, and a pfp",
  },
  {
    groupId: "TWITTER_NOT_SUFFICIENT",
    description:
      "Twitter users with < 2 followers or other indications of low reputation",
  },
];

async function main(): Promise<void> {
  console.log(colors.white.bold("\nSeeding groups...\n"));

  for (const group of groups) {
    let groupDocument = await Group.findByGroupId(group.groupId);

    if (groupDocument) {
      console.log(
        colors.white(`Document with id: ${groupDocument.id} already inserted`)
      );
    } else {
      groupDocument = await Group.create(group);

      await groupDocument.save();

      console.log(
        colors.white(`Document with id: ${groupDocument.id} inserted`)
      );
    }
  }

  console.log(colors.green.bold("\nDocuments inserted correctly ✓\n"));
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
