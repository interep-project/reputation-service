import { Web2Provider } from "@interrep/reputation-criteria"
import { currentNetwork } from "src/config"

export enum DeployedContracts {
    TWITTER_BADGE = "TWITTER_BADGE",
    GITHUB_BADGE = "GITHUB_BADGE",
    INTERREP_GROUPS = "INTERREP_GROUPS"
}

const deployedContracts: {
    [networkId: number]: { [key in DeployedContracts]: string }
} = {
    // hardhat
    31337: {
        [DeployedContracts.TWITTER_BADGE]: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        [DeployedContracts.GITHUB_BADGE]: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        [DeployedContracts.INTERREP_GROUPS]: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
    },
    3: {
        [DeployedContracts.TWITTER_BADGE]: "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
        [DeployedContracts.GITHUB_BADGE]: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        [DeployedContracts.INTERREP_GROUPS]: "0xa2A7f256B4Ea653eef95965D09bbdBb4b4526419"
    },
    42: {
        [DeployedContracts.TWITTER_BADGE]: "0x99FCf805C468977e0F8Ceae21935268EEceadC07",
        [DeployedContracts.GITHUB_BADGE]: "0xab0090f2F9C061C12D3Fa286079659Fe00e173bf",
        [DeployedContracts.INTERREP_GROUPS]: "0x8247BC4382ecc6Eb240d9A4CD51E9Aa85Ef75BD9"
    },
    421611: {
        [DeployedContracts.TWITTER_BADGE]: "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
        [DeployedContracts.GITHUB_BADGE]: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        [DeployedContracts.INTERREP_GROUPS]: "0xa2A7f256B4Ea653eef95965D09bbdBb4b4526419"
    },
    42161: {
        [DeployedContracts.TWITTER_BADGE]: "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
        [DeployedContracts.GITHUB_BADGE]: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        [DeployedContracts.INTERREP_GROUPS]: "0xa2A7f256B4Ea653eef95965D09bbdBb4b4526419"
    }
}

export const isNetworkWithDeployedContract = (id?: number): id is keyof typeof deployedContracts =>
    !!id && id in deployedContracts

export const getDeployedContractAddress = (contract: DeployedContracts): string =>
    deployedContracts[currentNetwork.id][contract]

export const getBadgeAddressByProvider = (web2Provider: Web2Provider): string | null => {
    switch (web2Provider) {
        case Web2Provider.TWITTER:
            return getDeployedContractAddress(DeployedContracts.TWITTER_BADGE)

        case Web2Provider.GITHUB:
            return getDeployedContractAddress(DeployedContracts.GITHUB_BADGE)

        default:
            throw new Error("Unsupported Web2 provider")
    }
}

export default deployedContracts
