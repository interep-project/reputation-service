/**
 * Create a human-readable attestation message for the user.
 * @param userAddress The address of the user.
 * @param accountId The provider account id of the user.
 * @returns The attestation message.
 */
export default function createUserMessage(userAddress: string, accountId: string): string {
    return `Sign this message to create your linking attestation between your Web3 address (${userAddress}) and your Web2 account id (${accountId}).`
}
