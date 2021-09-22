import { ContractTransaction } from "@ethersproject/contracts"
import { ContractName } from "src/config"
import getContractInstance from "src/utils/crypto/getContractInstance"
import stringToBigNumber from "src/utils/crypto/stringToBigNumber"

type MintNewTokenProps = {
    badgeAddress: string
    to: string
    tokenId: string
}

const mintNewToken = async ({ badgeAddress, to, tokenId }: MintNewTokenProps): Promise<ContractTransaction> => {
    if (!tokenId) throw new Error("Token id is not defined")

    const decimalId = stringToBigNumber(tokenId)
    const contractInstance = await getContractInstance(ContractName.REPUTATION_BADGE, badgeAddress)

    return contractInstance.safeMint(to, decimalId)
}

export default mintNewToken
