import { Contract } from "ethers"
import { ContractName } from "src/config"
import getContractInstance from "./getContractInstance"
import getSigner from "./getSigner"

export default async function getBackendContractInstance(
    contractName: ContractName,
    contractAddress: string
): Promise<Contract> {
    const contractInstance = getContractInstance(contractName, contractAddress)
    const signer = await getSigner()

    return contractInstance.connect(signer)
}
