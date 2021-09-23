import getNextConfig from "next/config"
import { SupportedNetwork } from "./types/network"

export enum Environment {
    TEST = "test",
    DEVELOPMENT = "development",
    PRODUCTION = "production"
}

export enum ContractName {
    INTERREP_GROUPS = "InterRepGroups",
    REPUTATION_BADGE = "ReputationBadge"
}

export const contractAddresses: Record<number, Record<ContractName, any>> = {
    31337: {
        [ContractName.REPUTATION_BADGE]: {
            twitter: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
            github: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
        },
        [ContractName.INTERREP_GROUPS]: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
    },
    3: {
        [ContractName.REPUTATION_BADGE]: {
            twitter: "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
            github: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
        },
        [ContractName.INTERREP_GROUPS]: "0xa2A7f256B4Ea653eef95965D09bbdBb4b4526419"
    },
    42: {
        [ContractName.REPUTATION_BADGE]: {
            twitter: "0x99FCf805C468977e0F8Ceae21935268EEceadC07",
            github: "0xab0090f2F9C061C12D3Fa286079659Fe00e173bf"
        },
        [ContractName.INTERREP_GROUPS]: "0x8247BC4382ecc6Eb240d9A4CD51E9Aa85Ef75BD9"
    },
    421611: {
        [ContractName.REPUTATION_BADGE]: {
            twitter: "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
            github: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
        },
        [ContractName.INTERREP_GROUPS]: "0xa2A7f256B4Ea653eef95965D09bbdBb4b4526419"
    },
    42161: {
        [ContractName.REPUTATION_BADGE]: {
            twitter: "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
            github: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
        },
        [ContractName.INTERREP_GROUPS]: "0xa2A7f256B4Ea653eef95965D09bbdBb4b4526419"
    }
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
        case Environment.DEVELOPMENT:
            return supportedNetworks.localhost
        case Environment.PRODUCTION: {
            const { defaultNetwork } = getNextConfig().publicRuntimeConfig

            if (!(defaultNetwork in supportedNetworks)) {
                throw new Error("DEFAULT_NETWORK variable has not been defined correctly")
            }

            return supportedNetworks[defaultNetwork]
        }
        default:
            return supportedNetworks.hardhat
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
