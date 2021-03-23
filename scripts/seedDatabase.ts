import { resolve } from "path";
import * as dotenv from "dotenv";
import { User } from "../models/users/User.model";
import { dbConnect, dbDisconnect } from "../server/util/database";

dotenv.config({ path: resolve(__dirname, "../.env") });

(async () => {
  dbConnect();

  const users = [
    { twitter: { name: "katka" } },
    { twitter: { name: "lavanaya" } },
    { twitter: { name: "david" } },
    { twitter: { name: "makaio" } },
  ];
  try {
    for (const user of users) {
      await User.create(user);
      console.log(`Created user ${user.twitter.name}`);
    }
    dbDisconnect();
  } catch (e) {
    console.error(e);
  }
})();
