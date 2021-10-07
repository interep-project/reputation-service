import { ReputationLevel } from "@interrep/reputation-criteria"
import { ethers } from "ethers"
import { ContractName } from "src/config"
import { Provider } from "src/types/groups"
import getBackendContractInstance from "src/utils/backend/getBackendContractInstance"
import getContractAddress from "src/utils/common/getContractAddress"
import { appendLeaf, previewNewRoot } from "./mts"
import { PoapGroupName } from "./poap"

export default async function addIdentityCommitment(
    provider: Provider,
    name: ReputationLevel | PoapGroupName,
    identityCommitment: string
): Promise<string> {
    // Get the value of the next root hash without saving anything in the db.
    const rootHash = await previewNewRoot(provider, name, identityCommitment)

    // Update the contract with new root.
    const contractAddress = getContractAddress(ContractName.INTERREP_GROUPS)
    const contractInstance = await getBackendContractInstance(ContractName.INTERREP_GROUPS, contractAddress)

    await contractInstance.addRootHash(
        ethers.utils.formatBytes32String(provider),
        ethers.utils.formatBytes32String(name),
        identityCommitment,
        rootHash
    )

    // Update the db with the new merkle tree.
    return appendLeaf(provider, name, identityCommitment)
}
