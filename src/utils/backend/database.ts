import mongoose from "mongoose"
import config from "src/config"
import logger from "./logger"

export async function dbConnect() {
    // check if we have a connection to the database or if it's currently
    // connecting or disconnecting (readyState 1, 2 and 3)
    if (mongoose.connection.readyState >= 1) {
        return
    }

    const { MONGO_URL } = config

    if (!MONGO_URL) {
        throw new Error("Please define the MONGO_URL environment variable inside .env")
    }

    await mongoose
        .connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
            autoIndex: true
        })
        .catch((error) => logger.error(error))

    const database = mongoose.connection

    database.once("open", () => {
        logger.info("🗄️ Connected to database")
    })

    database.on("error", (err) => {
        logger.error("Database connection error:", err)
    })
}

export const dbDisconnect = () => {
    if (!mongoose.connection) {
        return
    }
    mongoose.disconnect()
}
