import { dbConnect, dbDisconnect } from "src/utils/backend/database"
import seedZeroHashes from "src/utils/backend/seeding/seedZeroHashes"

async function main() {
    await dbConnect()

    await seedZeroHashes(true)

    dbDisconnect()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
