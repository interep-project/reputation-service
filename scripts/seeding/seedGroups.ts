import { dbConnect, dbDisconnect } from "src/utils/server/database";
import { seedGroups } from "./seedingFunctions";

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

(async () => {
  dbConnect();

  try {
    await seedGroups(groups);
    dbDisconnect();

    process.exit(0);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
})();
