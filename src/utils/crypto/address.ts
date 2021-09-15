import { getAddress } from "@ethersproject/address"

// returns the checksummed address if the address is valid, otherwise returns null
export function getChecksummedAddress(address: string): string | null {
    try {
        return getAddress(address)
    } catch {
        return null
    }
}
