import getNextConfig from "next/config"
import { NetworkData } from "./types/network"

const defaultEnv = {
    MERKLE_TREE_LEVELS: 16,
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
    INTERREP_GROUPS = "InterRepGroups",
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
        [ContractName.INTERREP_GROUPS]: "0x0165878A594ca255338adfa4d48449f69242Eb8F"
    },
    [SupportedChainId.KOVAN]: {
        [ContractName.REPUTATION_BADGE]: {
            twitter: "0x0Cb09b04016Ba1CfBF37359f0112F304F2381EB6",
            github: "0x091D7af24CA1eA4810467ff3321A5965256C1d14",
            reddit: "0xAB1855a7d02C771465411fDD4B63f647925d6c37"
        },
        [ContractName.INTERREP_GROUPS]: "0xB9A55B681BF8426ceb71F54d127D3391fd28a1E4"
    },
    [SupportedChainId.ROPSTEN]: {
        [ContractName.REPUTATION_BADGE]: {
            twitter: "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
            github: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
            reddit: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
        },
        [ContractName.INTERREP_GROUPS]: "0xa2A7f256B4Ea653eef95965D09bbdBb4b4526419"
    },

    [SupportedChainId.ARBITRUM_TESTNET]: {
        [ContractName.REPUTATION_BADGE]: {
            twitter: "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
            github: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
            reddit: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
        },
        [ContractName.INTERREP_GROUPS]: "0xa2A7f256B4Ea653eef95965D09bbdBb4b4526419"
    },
    [SupportedChainId.ARBITRUM]: {
        [ContractName.REPUTATION_BADGE]: {
            twitter: "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
            github: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
            reddit: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
        },
        [ContractName.INTERREP_GROUPS]: "0xa2A7f256B4Ea653eef95965D09bbdBb4b4526419"
    }
}

export const supportedNetworks: Record<string, NetworkData> = {
    localhost: {
        name: "localhost",
        chainId: SupportedChainId.LOCALHOST
    },
    kovan: {
        name: "ropsten",
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
            const { defaultNetwork } = getNextConfig().publicRuntimeConfig

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
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SIGNING_PRIVATE_KEY: process.env.JWT_SIGNING_PRIVATE_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    MERKLE_TREE_LEVELS: Number(process.env.MERKLE_TREE_LEVELS) || defaultEnv.MERKLE_TREE_LEVELS,
    API_WHITELIST: process.env.API_WHITELIST?.replace(/ /g, "").split(",") || defaultEnv.API_WHITELIST
}
