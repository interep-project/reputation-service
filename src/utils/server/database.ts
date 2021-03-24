import mongoose from "mongoose";
import config from "src/config";

export async function dbConnect() {
  const { MONGODB_URI } = config;

  // check if we have a connection to the database or if it's currently
  // connecting or disconnecting (readyState 1, 2 and 3)
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env"
    );
  }

  mongoose
    .connect(MONGODB_URI, {
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
