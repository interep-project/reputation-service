import { contractAddresses, ContractName, currentNetwork } from "src/config"

/**
 * Returns the contract address based on the contract name.
 * @param contractName The name of the contract.
 * @returns The address of the contract.
 */
export default function getContractAddress(contractName: ContractName): string {
    if (contractName === ContractName.INTEREP) {
        return contractAddresses[currentNetwork.chainId][ContractName.INTEREP]
    }

    throw new Error(`You must specify a valid contract name`)
}
