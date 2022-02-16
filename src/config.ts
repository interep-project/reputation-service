import getNextConfig from "next/config"
import { NetworkData } from "./types/network"

const defaultEnv = {
    MERKLE_TREE_DEPTH: 16, // 2^16 = 65536
    API_WHITELIST: [
        /^http:\/\/localhost/,
        /^http:\/\/127.0.0.1/,
        /^https:\/\/kovan\.interep\.link/,
        /^https:\/\/interep\.link/,
        /^https:\/\/auti\.sm/,
        /^https:\/\/www\.auti\.sm/
    ]
}

export enum Environment {
    TEST = "test",
    DEVELOPMENT = "development",
    PRODUCTION = "production"
}

export enum ContractName {
    GROUPS = "Groups"
}

export enum SupportedChainId {
    LOCALHOST = 31337,
    KOVAN = 42,
    ARBITRUM = 42161
}

export const contractAddresses: Record<number, Record<ContractName, any>> = {
    [SupportedChainId.LOCALHOST]: {
        [ContractName.GROUPS]: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
    },
    [SupportedChainId.KOVAN]: {
        [ContractName.GROUPS]: "0x8c29e0b77e32f704F03eeCE01c041192A5EB6c77"
    },
    [SupportedChainId.ARBITRUM]: {
        [ContractName.GROUPS]: "0xa2A7f256B4Ea653eef95965D09bbdBb4b4526419"
    }
}

export const supportedNetworks: Record<string, NetworkData> = {
    localhost: {
        name: "localhost",
        chainId: SupportedChainId.LOCALHOST
    },
    kovan: {
        name: "kovan",
        chainId: SupportedChainId.KOVAN
    },
    arbitrum: {
        name: "arbitrum",
        chainId: SupportedChainId.ARBITRUM
    }
}

export const currentNetwork: NetworkData = (function IIFE(): NetworkData {
    switch (process.env.NODE_ENV as Environment) {
        case Environment.PRODUCTION: {
            const nextConfig = getNextConfig()
            let defaultNetwork

            if (nextConfig) {
                defaultNetwork = getNextConfig().publicRuntimeConfig.defaultNetwork
            } else {
                // nextConfig is undefined when this file is imported from an external resource to nextJS.
                defaultNetwork = process.env.DEFAULT_NETWORK
            }

            if (!(defaultNetwork in supportedNetworks)) {
                throw new Error("DEFAULT_NETWORK variable has not been defined correctly")
            }

            return supportedNetworks[defaultNetwork]
        }
        default:
            return supportedNetworks.localhost
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
    REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
    GMAIL_ADDRESS: process.env.GMAIL_ADDRESS,
    GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN,
    GMAIL_ACCESS_TOKEN: process.env.GMAIL_ACCESS_TOKEN,
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SIGNING_PRIVATE_KEY: process.env.JWT_SIGNING_PRIVATE_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    MERKLE_TREE_DEPTH: Number(process.env.MERKLE_TREE_DEPTH) || defaultEnv.MERKLE_TREE_DEPTH,
    API_WHITELIST: defaultEnv.API_WHITELIST
}
