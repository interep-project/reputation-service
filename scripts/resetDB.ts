import { clearDatabase, connectDatabase, disconnectDatabase } from "src/utils/backend/database"
import { seedZeroHashes } from "src/utils/backend/seeding"

async function main() {
    await connectDatabase()
    await clearDatabase()

    await seedZeroHashes()

    await disconnectDatabase()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
