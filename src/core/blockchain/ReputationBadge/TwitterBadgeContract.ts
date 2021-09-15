import ReputationBadge from "contracts/artifacts/contracts/ReputationBadge.sol/ReputationBadge.json"
import { Contract } from "ethers"
import { ethers } from "hardhat"
import { stringToBigNumber } from "src/utils/crypto/bigNumber"
import { DeployedContracts, getDeployedContractAddress } from "src/utils/crypto/deployedContracts"

const ReputationBadgeInterface = new ethers.utils.Interface(ReputationBadge.abi)

// TODO: Refactor this file
let instance: Contract

export const getInstance = async (contractAddress?: string) => {
    if (instance) return instance
    const address = contractAddress || getDeployedContractAddress(DeployedContracts.TWITTER_BADGE)

    if (!address) {
        throw new Error("Address not provided for instantiating Twitter Badge contract")
    }

    instance = await ethers.getContractAt("ReputationBadge", address)

    if (!instance) {
        throw new Error("Error while instantiating Twitter Badge contract")
    }
    return instance
}

export const exists = async (tokenId: string): Promise<boolean> => {
    const instance = await getInstance()

    const tokenIdBigNum = stringToBigNumber(tokenId)

    return instance.exists(tokenIdBigNum)
}

export const getTransferEvent = async (
    from?: string,
    to?: string,
    tokenId?: string,
    contractAddress?: string
): Promise<any[]> => {
    // console.log(`getting transfer event for ${tokenId}`);
    const instance = await getInstance(contractAddress)
    let topics: (string | string[])[] | undefined

    let decimalId
    if (tokenId) {
        decimalId = stringToBigNumber(tokenId)
    }

    if (from || to || decimalId) {
        topics = instance.filters.Transfer(from, to, decimalId).topics
    }
    let logs

    try {
        logs = await ethers.provider.getLogs({
            address: contractAddress || instance.address,
            topics,
            fromBlock: 1000000,
            toBlock: "latest"
        })
    } catch (e) {
        console.error(`Error getting logs:`, e)
    }
    if (!logs) throw new Error("Failed to get logs")

    const decodedEvents = logs.map((log) => ({
        ...ReputationBadgeInterface.decodeEventLog("Transfer", log.data, log.topics)
    }))

    // console.log(`decodedEvents`, decodedEvents);
    return decodedEvents
}

export default { getInstance, exists, getTransferEvent }
