import { ReputationLevel } from "@interrep/reputation-criteria"
import { ethers } from "ethers"
import { ContractName } from "src/config"
import { Provider } from "src/types/groups"
import getBackendContractInstance from "src/utils/backend/getBackendContractInstance"
import getContractAddress from "src/utils/common/getContractAddress"
import { deleteLeaf, retrievePath } from "src/core/groups/mts"
import { PoapEvent } from "src/core/poap"

export default async function deleteIdentityCommitment(
    provider: Provider,
    name: ReputationLevel | PoapEvent | string,
    identityCommitment: string
): Promise<string> {
    const contractAddress = getContractAddress(ContractName.GROUPS)
    const contractInstance = await getBackendContractInstance(ContractName.GROUPS, contractAddress)
    const { indices, pathElements } = await retrievePath(provider, name, identityCommitment)

    await contractInstance.deleteIdentityCommitment(
        ethers.utils.formatBytes32String(provider),
        ethers.utils.formatBytes32String(name),
        identityCommitment,
        pathElements,
        indices
    )

    return deleteLeaf(provider, name, identityCommitment)
}
