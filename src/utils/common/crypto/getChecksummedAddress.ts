import { getAddress } from "@ethersproject/address"

/**
 * Returns the checksummed address if the address is valid, otherwise returns null.
 * @param address Address to check.
 * @returns Checksummed address or null.
 */
export default function getChecksummedAddress(address: string): string | null {
    try {
        return getAddress(address)
    } catch {
        return null
    }
}
