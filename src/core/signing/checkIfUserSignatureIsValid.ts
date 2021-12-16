import { ethers } from "ethers"
import logger from "src/utils/backend/logger"
import { createAttestationMessage } from "../badges"

type CheckIfUserSignatureIsValidParams = {
    checksummedAddress: string
    accountId: string
    userSignature: string
}

export default function checkIfUserSignatureIsValid({
    checksummedAddress,
    accountId,
    userSignature
}: CheckIfUserSignatureIsValidParams): boolean {
    const recreatedMessageSignedByUser = createAttestationMessage(checksummedAddress, accountId)

    const signerAddress = ethers.utils.verifyMessage(recreatedMessageSignedByUser, userSignature)

    logger.silly(`[Linking] Signer address: ${signerAddress}`)

    if (signerAddress !== checksummedAddress) {
        return false
    }

    return true
}
