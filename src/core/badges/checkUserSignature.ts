import { ethers } from "ethers"
import createUserMessage from "./createUserMessage"

/**
 * Returns true if the user signature is valid, otherwise it returns false.
 * @param userAddress The address of the user.
 * @param accountId The provider account id of the user.
 * @param userSignature The signature of the user.
 * @returns True or false.
 */
export default function checkUserSignature(userAddress: string, accountId: string, userSignature: string): boolean {
    // Create the user message used in the frontend.
    const userMessage = createUserMessage(userAddress, accountId)

    return ethers.utils.verifyMessage(userMessage, userSignature) === userAddress
}
