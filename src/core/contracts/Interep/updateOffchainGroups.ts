/* istanbul ignore file */
import { ContractReceipt, utils } from "ethers"
import config, { ContractName } from "src/config"
import { GroupName, Provider } from "src/types/groups"
import { getBackendContractInstance } from "src/utils/backend"
import { getContractAddress } from "src/utils/common"

export default async function updateOffchainGroups(
    providers: Provider[],
    names: GroupName[],
    roots: string[]
): Promise<ContractReceipt> {
    const contractAddress = getContractAddress(ContractName.INTEREP)
    const contractInstance = await getBackendContractInstance(ContractName.INTEREP, contractAddress)

    const groups = []

    for (let i = 0; i < providers.length; i++) {
        groups.push({
            provider: utils.formatBytes32String(providers[i]),
            name: utils.formatBytes32String(names[i]),
            depth: config.MERKLE_TREE_DEPTH,
            root: roots[i]
        })
    }

    const transaction = await contractInstance.updateOffchainGroups(groups)

    return transaction.wait(1)
}
