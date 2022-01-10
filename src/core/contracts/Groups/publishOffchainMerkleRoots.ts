/* istanbul ignore file */
import { ReputationLevel } from "@interrep/reputation"
import { ContractReceipt, ethers } from "ethers"
import { ContractName } from "src/config"
import { PoapEvent } from "src/core/poap"
import { Provider } from "src/types/groups"
import { getBackendContractInstance } from "src/utils/backend"
import { getContractAddress } from "src/utils/common"

export default async function publishOffchainMerkleRoots(
    providers: Provider[],
    names: (ReputationLevel | PoapEvent | string)[],
    roots: string[]
): Promise<ContractReceipt> {
    const contractAddress = getContractAddress(ContractName.GROUPS)
    const contractInstance = await getBackendContractInstance(ContractName.GROUPS, contractAddress)

    const transaction = await contractInstance.publishOffchainMerkleRoots(
        providers.map(ethers.utils.formatBytes32String),
        names.map(ethers.utils.formatBytes32String),
        roots
    )

    return transaction.wait(1)
}
