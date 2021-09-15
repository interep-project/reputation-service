import seedZeroHashes from "src/utils/seeding/seedRootHashes"
import { dbConnect, dbDisconnect } from "src/utils/server/database"
;(async () => {
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
