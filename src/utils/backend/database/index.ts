import { connectDatabase, clearDatabase, disconnectDatabase } from "./database"
import {
    connectDatabase as connectTestingDatabase,
    disconnectDatabase as disconnectTestingDatabase,
    clearDatabase as clearTestingDatabase
} from "./testingDatabase"

export {
    connectDatabase,
    clearDatabase,
    disconnectDatabase,
    connectTestingDatabase,
    disconnectTestingDatabase,
    clearTestingDatabase
}
