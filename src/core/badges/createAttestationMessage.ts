export default function createAttestationMessage(address: string, accountId: string): string {
    return `Sign this message to create your linking attestation between your Web3 address (${address}) and your Web2 account id (${accountId}).`
}
