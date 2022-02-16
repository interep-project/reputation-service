/* istanbul ignore file */
import { clear, connect, disconnect, drop } from "@interep/db"
import { MongoMemoryServer } from "mongodb-memory-server"

let mms: MongoMemoryServer

export async function connectDatabase() {
    mms = await MongoMemoryServer.create()
    await connect(mms.getUri())
}

export async function disconnectDatabase() {
    await drop()
    await disconnect()
    await mms.stop()
}

export async function clearDatabase() {
    await clear()
}
