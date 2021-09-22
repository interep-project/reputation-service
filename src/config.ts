import getNextConfig from "next/config"
import { SupportedNetwork } from "./types/network"

export enum Environment {
    TEST = "test",
    DEVELOPMENT = "development",
    PRODUCTION = "production"
}

export const supportedNetworks: Record<string, SupportedNetwork> = {
    hardhat: {
        name: "hardhat",
        id: 31337
    },
    localhost: {
        name: "localhost",
        id: 31337
    },
    kovan: {
        name: "hardhat",
        id: 42
    },
    ropsten: {
        name: "ropsten",
        id: 3
    },
    arbitrum: {
        name: "arbitrum",
        id: 42161
    }
}

export const currentNetwork = (function IIFE() {
    switch (process.env.NODE_ENV as Environment) {
        case Environment.TEST:
            return supportedNetworks.hardhat
        case Environment.DEVELOPMENT:
            return supportedNetworks.localhost
        case Environment.PRODUCTION: {
            const { defaultNetwork } = getNextConfig().publicRuntimeConfig

            if (!(defaultNetwork in Object.keys(supportedNetworks))) {
                throw new Error("DEFAULT_NETWORK variable has not been defined correctly")
            }

            return supportedNetworks[defaultNetwork]
        }
        default:
            throw new Error("NODE_ENV variable has not been defined correctly")
    }
})()

export default {
    MONGO_URL: process.env.MONGO_URL,
    TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET,
    TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SIGNING_PRIVATE_KEY: process.env.JWT_SIGNING_PRIVATE_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    MERKLE_TREE_LEVELS: Number(process.env.MERKLE_TREE_LEVELS) || 16
}
