import getNextConfig from "next/config"
import { NetworkData } from "./types/network"

const defaultEnv = {
    MERKLE_TREE_DEPTH: 16, // 2^16 = 65536
    API_WHITELIST: [
        /^http:\/\/localhost/,
        /^http:\/\/127.0.0.1/,
        /^https:\/\/kovan\\.interrep\\.link/,
        /^https:\/\/ropsten\\.interrep\\.link/,
        /^https:\/\/interrep\\.link/,
        /^https:\/\/auti\\.sm/,
        /^https:\/\/www\\.auti\\.sm/
    ]
}

export enum Environment {
    TEST = "test",
    DEVELOPMENT = "development",
    PRODUCTION = "production"
}

export enum ContractName {
    GROUPS = "Groups",
    REPUTATION_BADGE = "ReputationBadge"
}

export enum SupportedChainId {
    LOCALHOST = 31337,
    KOVAN = 42,
    ROPSTEN = 3,
    ARBITRUM = 42161,
    ARBITRUM_TESTNET = 421611
}

export const contractAddresses: Record<number, Record<ContractName, any>> = {
    [SupportedChainId.LOCALHOST]: {
        [ContractName.REPUTATION_BADGE]: {
            twitter: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
            github: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
            reddit: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
        },
        [ContractName.GROUPS]: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"
    },
    [SupportedChainId.KOVAN]: {
        [ContractName.REPUTATION_BADGE]: {
            twitter: "0x346a936b19071b2f619200848B8ADbb938D72250",
            github: "0xb69aABB5D8d8e4920834761bD0C9DEEfa5D5502F",
            reddit: "0x9f44be9F69aF1e049dCeCDb2d9296f36C49Ceafb"
        },
        [ContractName.GROUPS]: "0xc068f3F15f367a60eb2B7c0620961A15A3b36fA3"
    },
    [SupportedChainId.ROPSTEN]: {
        [ContractName.REPUTATION_BADGE]: {
            twitter: "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
            github: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
            reddit: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
        },
        [ContractName.GROUPS]: "0xa2A7f256B4Ea653eef95965D09bbdBb4b4526419"
    },
    [SupportedChainId.ARBITRUM_TESTNET]: {
        [ContractName.REPUTATION_BADGE]: {
            twitter: "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
            github: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
            reddit: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
        },
        [ContractName.GROUPS]: "0xa2A7f256B4Ea653eef95965D09bbdBb4b4526419"
    },
    [SupportedChainId.ARBITRUM]: {
        [ContractName.REPUTATION_BADGE]: {
            twitter: "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
            github: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
            reddit: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
        },
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
    ropsten: {
        name: "ropsten",
        chainId: SupportedChainId.ROPSTEN
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
    API_WHITELIST: process.env.API_WHITELIST?.replace(/ /g, "").split(",") || defaultEnv.API_WHITELIST
}
