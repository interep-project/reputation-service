import mongoose from "mongoose";
import config from "src/config";

export async function dbConnect() {
  // check if we have a connection to the database or if it's currently
  // connecting or disconnecting (readyState 1, 2 and 3)
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const { MONGO_URL } = config;

  if (!MONGO_URL) {
    throw new Error(
      "Please define the MONGO_URL environment variable inside .env"
    );
  }

  mongoose
    .connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      autoIndex: true,
    })
    .catch((error) => console.error(error));

  const database = mongoose.connection;
  database.once("open", async () => {
    console.log("🗄️ Connected to database");
  });
  database.on("error", () => {
    console.log("Error connecting to database");
  });
}

export const dbDisconnect = () => {
  if (!mongoose.connection) {
    return;
  }
  mongoose.disconnect();
};
