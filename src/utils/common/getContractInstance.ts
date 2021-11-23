import Groups from "contract-artifacts/Groups.json"
import ReputationBadge from "contract-artifacts/ReputationBadge.json"
import { Contract } from "ethers"
import { ContractName } from "src/config"

export default function getContractInstance(contractName: ContractName, contractAddress: string): Contract {
    switch (contractName) {
        case ContractName.REPUTATION_BADGE:
            return new Contract(contractAddress, ReputationBadge.abi)
        case ContractName.GROUPS:
            return new Contract(contractAddress, Groups.abi)
        default:
            throw new TypeError(`${contractName} contract does not exist`)
    }
}
