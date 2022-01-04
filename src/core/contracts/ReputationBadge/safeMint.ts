import { OAuthProvider } from "@interrep/reputation"
import { ContractReceipt } from "ethers"
import { ContractName } from "src/config"
import { getBackendContractInstance } from "src/utils/backend"
import { getContractAddress } from "src/utils/common"

export default async function safeMint(to: string, tokenId: string, provider: OAuthProvider): Promise<ContractReceipt> {
    const contractAddress = getContractAddress(ContractName.REPUTATION_BADGE, provider)
    const contractInstance = await getBackendContractInstance(ContractName.REPUTATION_BADGE, contractAddress)

    const transaction = await contractInstance.safeMint(to, tokenId)

    return transaction.wait(1)
}
