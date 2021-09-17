import getNextConfig from "next/config"

const TREE_LEVELS = 15
const nextConfig = getNextConfig()

let defaultNetwork

if (nextConfig && process.env.NODE_ENV && process.env.NODE_ENV !== "test") {
    defaultNetwork = nextConfig.publicRuntimeConfig.defaultNetwork

    if (!defaultNetwork) {
        throw new Error("Default network is not defined")
    }
} else {
    defaultNetwork = "kovan"
}

export enum SupportedChainId {
    hardhat = 31337,
    localhost = 31337,
    kovan = 42,
    ropsten = 3,
    arbitrum = 42161
}

export const defaultNetworkByEnv = {
    test: { id: SupportedChainId.hardhat, name: "hardhat" },
    development: { id: SupportedChainId.localhost, name: "localhost" },
    production: {
        id: SupportedChainId[defaultNetwork],
        name: defaultNetwork
    }
}

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
    TREE_LEVELS
}
