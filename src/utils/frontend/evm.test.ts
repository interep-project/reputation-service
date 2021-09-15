import { getChainNameFromNetworkId, shortenAddress } from "src/utils/frontend/evm"

describe("getChainNameFromNetworkId", () => {
    it("should return null if the network id is unknown", () => {
        expect(getChainNameFromNetworkId(0)).toBeNull()
    })

    it("should return the network name from the id", () => {
        expect(getChainNameFromNetworkId(1)).toBe("Ethereum Mainnet")
    })
})

describe("#shortenAddress", () => {
    it("throws on invalid address", () => {
        expect(() => shortenAddress("abc")).toThrow("Invalid 'address'")
    })

    it("truncates middle characters", () => {
        expect(shortenAddress("0xf164fc0ec4e93095b804a4795bbe1e041497b92a")).toBe("0xf164...b92a")
    })

    it("truncates middle characters even without prefix", () => {
        expect(shortenAddress("f164fc0ec4e93095b804a4795bbe1e041497b92a")).toBe("0xf164...b92a")
    })

    it("renders checksummed address", () => {
        expect(shortenAddress("0x2E1b342132A67Ea578e4E3B814bae2107dc254CC".toLowerCase())).toBe("0x2E1b...54CC")
    })
})
