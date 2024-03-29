import shortenAddress from "./shortenAddress"
import getExplorerLink, { ExplorerDataType } from "./getExplorerLink"
import { groupBy, mapReputationRule } from "."

describe("# utils/frontend", () => {
    describe("# shortenAddress", () => {
        it("Should throw an error if the address is not valid", () => {
            const fun = () => shortenAddress("abc")

            expect(fun).toThrow("invalid address")
        })

        it("Should truncate the middle characters", () => {
            const expectedValue = shortenAddress("0xf164fc0ec4e93095b804a4795bbe1e041497b92a")

            expect(expectedValue).toBe("0xf164...b92a")
        })

        it("Should truncate the middle characters even without prefix", () => {
            const expectedValue = shortenAddress("f164fc0ec4e93095b804a4795bbe1e041497b92a")

            expect(expectedValue).toBe("0xf164...b92a")
        })

        it("Should return a checksummed address", () => {
            const expectedValue = shortenAddress("0x2E1b342132A67Ea578e4E3B814bae2107dc254CC".toLowerCase())

            expect(expectedValue).toBe("0x2E1b...54CC")
        })
    })

    describe("# getExplorerLink", () => {
        it("Should create an Etherscan link for an address", () => {
            const address = "0xf164fc0ec4e93095b804a4795bbe1e041497b92a"

            const expectedValue = getExplorerLink(ExplorerDataType.ADDRESS, address)

            expect(expectedValue).toContain(`etherscan.io/address/${address}`)
        })
    })

    describe("# groupBy", () => {
        it("Should group an array", () => {
            const array = [{ x: "a" }, { x: "b" }, { x: "a" }]

            const expectedValue = groupBy(array, "x", ["a"])

            expect(expectedValue).toHaveLength(1)
            expect(expectedValue[0][0]).toBe("a")
            expect(expectedValue[0][1]).toHaveLength(2)
        })
    })

    describe("# mapReputationRule", () => {
        it("Should map a number reputation rule", () => {
            const rule = { parameter: "a", value: 1233 }

            const expectedValue = mapReputationRule(rule)

            expect(expectedValue).toBe("1.2k")
        })

        it("Should map a boolean reputation rule", () => {
            const rule1 = { parameter: "a", value: true }
            const rule2 = { parameter: "a", value: false }

            const expectedValue1 = mapReputationRule(rule1)
            const expectedValue2 = mapReputationRule(rule2)

            expect(expectedValue1).toBe("Yes")
            expect(expectedValue2).toBe("No")
        })

        it("Should map advanced reputation rules", () => {
            const rule1 = { parameter: "a", value: { ">": 1233 } }
            const rule2 = { parameter: "a", value: { "<": 1233 } }

            const expectedValue1 = mapReputationRule(rule1)
            const expectedValue2 = mapReputationRule(rule2)

            expect(expectedValue1).toBe("> 1.2k")
            expect(expectedValue2).toBe("< 1.2k")
        })

        it("Should map null reputation rules", () => {
            const rule1 = { parameter: "a", value: null }
            const rule2 = { parameter: "a", value: {} }

            const expectedValue1 = mapReputationRule(rule1 as any)
            const expectedValue2 = mapReputationRule(rule2 as any)

            expect(expectedValue1).toBe("N/A")
            expect(expectedValue2).toBe("N/A")
        })
    })
})
