import { ReputationLevel } from "@interrep/reputation-criteria"
import { ethers } from "ethers"
import { ContractName } from "src/config"
import { Provider } from "src/types/groups"
import getBackendContractInstance from "src/utils/backend/getBackendContractInstance"
import getContractAddress from "src/utils/common/getContractAddress"
import { appendLeaf, previewNewRoot } from "./mts"
import { PoapGroupName } from "./poap"

export default async function addIdentityCommitments(
    provider: Provider,
    names: (ReputationLevel | PoapGroupName | string)[],
    identityCommitments: string | string[]
): Promise<void> {
    identityCommitments = Array.isArray(identityCommitments)
        ? identityCommitments
        : Array(names.length).fill(identityCommitments)

    // Get the value of the next root hashes without saving anything in the db.
    const rootHashes = await Promise.all(names.map((name, i) => previewNewRoot(provider, name, identityCommitments[i])))

    // Update the contract with new root hashes.
    const contractAddress = getContractAddress(ContractName.INTERREP_GROUPS)
    const contractInstance = await getBackendContractInstance(ContractName.INTERREP_GROUPS, contractAddress)

    await contractInstance.batchAddRootHash(
        ethers.utils.formatBytes32String(provider),
        names.map(ethers.utils.formatBytes32String),
        identityCommitments,
        rootHashes
    )

    // Update the db with the new merkle trees.
    await Promise.all(names.map((name, i) => appendLeaf(provider, name, identityCommitments[i])))
}
