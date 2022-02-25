/* istanbul ignore file */
import { ContractReceipt } from "ethers"
import { solidityKeccak256 } from "ethers/lib/utils"
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

    const groupIds = []
    const groups = []

    for (let i = 0; i < providers.length; i++) {
        groupIds.push(solidityKeccak256(["string", "string"], [providers[i], names[i]]))
        groups.push({
            depth: config.MERKLE_TREE_DEPTH,
            root: roots[i]
        })
    }

    const transaction = await contractInstance.updateOffchainGroups(groupIds, groups)

    return transaction.wait(1)
}
