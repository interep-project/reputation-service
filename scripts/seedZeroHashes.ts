import { dbConnect, dbDisconnect } from "src/utils/backend/database"
import seedZeroHashes from "src/utils/backend/seeding/seedZeroHashes"
;(async function IIFE() {
    dbConnect()

    try {
        await seedZeroHashes(true)
        dbDisconnect()

        process.exit(0)
    } catch (error) {
        console.error(error)

        process.exit(1)
    }
})()
