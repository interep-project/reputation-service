import { Contract } from "ethers"
import { ethers } from "hardhat"
import { ContractName } from "src/config"

export default async function getContractInstance(contractName: ContractName, address: string): Promise<Contract> {
    return ethers.getContractAt(contractName, address)
}
