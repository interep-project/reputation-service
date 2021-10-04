import getProvider from "./getProvider"

export default async function isTransactionConfirmed(txHash: string): Promise<boolean> {
    const provider = getProvider()
    const receipt = await provider.getTransactionReceipt(txHash)

    if (!receipt || receipt.confirmations < 3) return false

    return true
}
