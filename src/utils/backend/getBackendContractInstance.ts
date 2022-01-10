/* istanbul ignore file */
import { Contract } from "ethers"
import { ContractName } from "src/config"
import { getSigner } from "src/utils/backend"
import { getContractInstance } from "src/utils/common"

export default async function getBackendContractInstance(
    contractName: ContractName,
    contractAddress: string
): Promise<Contract> {
    const contractInstance = getContractInstance(contractName, contractAddress)
    const backendSigner = await getSigner()

    return contractInstance.connect(backendSigner)
}
