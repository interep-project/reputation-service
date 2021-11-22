import { ReputationLevel } from "@interrep/reputation-criteria"
import { ethers } from "ethers"
import { ContractName } from "src/config"
import { Provider } from "src/types/groups"
import getBackendContractInstance from "src/utils/backend/getBackendContractInstance"
import getContractAddress from "src/utils/common/getContractAddress"
import { deleteLeaf, retrievePath } from "./mts"
import { PoapGroupName } from "./poap"

export default async function deleteIdentityCommitment(
    provider: Provider,
    name: ReputationLevel | PoapGroupName | string,
    identityCommitment: string
): Promise<string> {
    // Update the contract with new root.
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

    // Update the db with the new Merkle tree.
    return deleteLeaf(provider, name, identityCommitment)
}
