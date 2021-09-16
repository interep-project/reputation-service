import { ethers } from "ethers"
import logger from "src/utils/server/logger"
import { createUserAttestationMessage } from "./createUserAttestationMessage"

type CheckIfUserSignatureIsValidParams = {
    checksummedAddress: string
    web2AccountId: string
    userSignature: string
}

export default function checkIfUserSignatureIsValid({
    checksummedAddress,
    web2AccountId,
    userSignature
}: CheckIfUserSignatureIsValidParams): boolean {
    const recreatedMessageSignedByUser = createUserAttestationMessage({
        checksummedAddress,
        web2AccountId
    })

    const signerAddress = ethers.utils.verifyMessage(recreatedMessageSignedByUser, userSignature)

    logger.silly(`[Linking] Signer address: ${signerAddress}`)

    if (signerAddress !== checksummedAddress) {
        return false
    }

    return true
}
