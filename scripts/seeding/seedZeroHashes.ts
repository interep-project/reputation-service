import { dbConnect, dbDisconnect } from "src/utils/server/database";
import { seedZeroHashes } from "./seedingFunctions";

(async () => {
  dbConnect();

  try {
    await seedZeroHashes();
    dbDisconnect();

    process.exit(0);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
})();
