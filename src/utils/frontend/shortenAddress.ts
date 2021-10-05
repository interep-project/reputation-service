import getChecksummedAddress from "src/utils/common/crypto/getChecksummedAddress"

export default function shortenAddress(address: string, chars = 4): string {
    const parsed = getChecksummedAddress(address)

    if (!parsed) {
        throw Error(`Invalid 'address' parameter '${address}'.`)
    }

    return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}
