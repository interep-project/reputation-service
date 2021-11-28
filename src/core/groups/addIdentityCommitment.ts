import { ReputationLevel } from "@interrep/reputation-criteria"
import { ethers } from "ethers"
import config, { ContractName } from "src/config"
import { Provider } from "src/types/groups"
import getBackendContractInstance from "src/utils/backend/getBackendContractInstance"
import getContractAddress from "src/utils/common/getContractAddress"
import { appendLeaf } from "./mts"
import { PoapGroupName } from "./poap"

export default async function addIdentityCommitment(
    provider: Provider,
    name: ReputationLevel | PoapGroupName | string,
    identityCommitment: string
): Promise<string> {
    // Update the contract with new root.
    const contractAddress = getContractAddress(ContractName.GROUPS)
    const contractInstance = await getBackendContractInstance(ContractName.GROUPS, contractAddress)
    const contractOwner = await contractInstance.signer.getAddress()

    const groupRoot = await contractInstance.getRoot(
        ethers.utils.formatBytes32String(provider),
        ethers.utils.formatBytes32String(name)
    )
    // If the group has not yet been created, it creates it.
    if (groupRoot.toString() === "0") {
        const tx = await contractInstance.createGroup(
            ethers.utils.formatBytes32String(provider),
            ethers.utils.formatBytes32String(name),
            config.MERKLE_TREE_DEPTH,
            contractOwner
        )

        await tx.wait(1)
    }

    await contractInstance.addIdentityCommitment(
        ethers.utils.formatBytes32String(provider),
        ethers.utils.formatBytes32String(name),
        identityCommitment
    )

    // Update the db with the new Merkle tree.
    return appendLeaf(provider, name, identityCommitment)
}
