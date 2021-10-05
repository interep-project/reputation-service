import InterRepGroups from "contract-artifacts/contracts/InterRepGroups.sol/InterRepGroups.json"
import ReputationBadge from "contract-artifacts/contracts/ReputationBadge.sol/ReputationBadge.json"
import { Contract } from "ethers"
import { ContractName } from "src/config"

export default function getContractInstance(contractName: ContractName, contractAddress: string): Contract {
    switch (contractName) {
        case ContractName.REPUTATION_BADGE:
            return new Contract(contractAddress, ReputationBadge.abi)
        case ContractName.INTERREP_GROUPS:
            return new Contract(contractAddress, InterRepGroups.abi)
        default:
            throw new TypeError(`${contractName} contract does not exist`)
    }
}
