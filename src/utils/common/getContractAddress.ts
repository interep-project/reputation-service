import { OAuthProvider } from "@interrep/reputation"
import { contractAddresses, ContractName, currentNetwork } from "src/config"

/**
 * Returns the contract address based on the name and provider passed as parameters.
 * @param contractName The name of the contract.
 * @param provider The OAuth provider.
 * @returns The address of the contract.
 */
export default function getContractAddress(contractName: ContractName, provider?: OAuthProvider): string {
    if (contractName === ContractName.GROUPS) {
        return contractAddresses[currentNetwork.chainId][ContractName.GROUPS]
    }

    if (!provider) {
        throw new Error(`You must specify a OAuth provider to obtain a ${contractName} address`)
    }

    return contractAddresses[currentNetwork.chainId][ContractName.REPUTATION_BADGE][provider]
}
