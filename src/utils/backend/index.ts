import getBackendContractInstance from "./getBackendContractInstance"
import getProvider from "./getProvider"
import getSigner from "./getSigner"
import logger from "./logger"
import removeDBFields from "./removeDBFields"
import runAPIMiddleware from "./runAPIMiddleware"
import getCors from "./getCors"
import { connectDatabase } from "./database"

export {
    connectDatabase,
    getSigner,
    getProvider,
    getBackendContractInstance,
    runAPIMiddleware,
    logger,
    removeDBFields,
    getCors
}
