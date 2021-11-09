import { ReputationLevel } from "@interrep/reputation-criteria"
import { ethers } from "ethers"
import { ContractName } from "src/config"
import { Provider } from "src/types/groups"
import getBackendContractInstance from "src/utils/backend/getBackendContractInstance"
import getContractAddress from "src/utils/common/getContractAddress"
import { appendLeaf } from "./mts"
import { PoapGroupName } from "./poap"

export default async function addIdentityCommitments(
    provider: Provider,
    names: (ReputationLevel | PoapGroupName | string)[],
    identityCommitments: string | string[]
): Promise<void> {
    identityCommitments = Array.isArray(identityCommitments)
        ? identityCommitments
        : Array(names.length).fill(identityCommitments)

    // Update the contract with new root hashes.
    const contractAddress = getContractAddress(ContractName.GROUPS)
    const contractInstance = await getBackendContractInstance(ContractName.GROUPS, contractAddress)

    await contractInstance.batchAddIdentityCommitment(
        ethers.utils.formatBytes32String(provider),
        names.map(ethers.utils.formatBytes32String),
        identityCommitments
    )

    // Update the db with the new Merkle trees.
    await Promise.all(names.map((name, i) => appendLeaf(provider, name, identityCommitments[i])))
}
