import { connectDatabase, dropDatabase, disconnectDatabase } from "./database"
import {
    connectDatabase as connectTestingDatabase,
    disconnectDatabase as disconnectTestingDatabase,
    clearDatabase as clearTestingDatabase
} from "./testingDatabase"

export {
    connectDatabase,
    dropDatabase,
    disconnectDatabase,
    connectTestingDatabase,
    disconnectTestingDatabase,
    clearTestingDatabase
}
