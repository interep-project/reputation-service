import Interep from "contract-artifacts/Interep.json"
import { Contract } from "ethers"
import { ContractName } from "src/config"

/**
 * Returns a contract instance.
 * @param contractName The name of the contract.
 * @param contractAddress The address of the contract.
 * @returns The contract instance.
 */
export default function getContractInstance(contractName: ContractName, contractAddress: string): Contract {
    switch (contractName) {
        case ContractName.INTEREP:
            return new Contract(contractAddress, Interep.abi)
        default:
            throw new TypeError(`${contractName} contract does not exist`)
    }
}
