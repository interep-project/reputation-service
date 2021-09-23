import getChecksummedAddress from "src/utils/crypto/getChecksummedAddress"

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export default function shortenAddress(address: string, chars = 4): string {
    const parsed = getChecksummedAddress(address)
    if (!parsed) {
        throw Error(`Invalid 'address' parameter '${address}'.`)
    }
    return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}
