import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"

let mongod: MongoMemoryServer

export const connect = async () => {
    mongod = await MongoMemoryServer.create()

    await mongoose.connect(mongod.getUri(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoIndex: true
    })
}

export const dropDatabaseAndDisconnect = async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongod.stop()
}

export const clearDatabase = async () => {
    const { collections } = mongoose.connection
    const promises: Promise<any>[] = []

    for (const key in collections) {
        if (Object.prototype.hasOwnProperty.call(collections, key)) {
            const collection = collections[key]

            promises.push(collection.deleteMany({}))
        }
    }

    await Promise.all(promises)
}
