import { Contract, ethers } from "ethers"
import { ContractName } from "src/config"
import { getNetworkFullName } from "."
import capitalize from "./capitalize"
import formatNumber from "./formatNumber"
import delay from "./delay"
import getContractAddress from "./getContractAddress"
import getContractInstance from "./getContractInstance"

describe("# utils/common", () => {
    describe("# capitalize", () => {
        it("Should capitalize a simple string", () => {
            const expectedValue = capitalize("hello")

            expect(expectedValue).toBe("Hello")
        })

        it("Should capitalize a more complex string", () => {
            const expectedValue = capitalize("hello world")

            expect(expectedValue).toBe("Hello World")
        })
    })

    describe("# formatNumber", () => {
        it("Should format a number", () => {
            const expectedValue = formatNumber(1234)

            expect(expectedValue).toBe("1.2k")
        })

        it("Should format a bigger number with 3 digits", () => {
            const expectedValue = formatNumber(123400, 3)

            expect(expectedValue).toBe("123.4k")
        })

        it("Should return 0", () => {
            const expectedValue = formatNumber(0.3, 3)

            expect(expectedValue).toBe("0")
        })
    })

    describe("# delay", () => {
        it("Should create a delay promise", async () => {
            expect(delay).not.toThrow()
        })
    })

    describe("# getContractAddress", () => {
        it("Should return a Groups contract address", async () => {
            const expectedValue = getContractAddress(ContractName.INTEREP)

            expect(expectedValue).toContain("0x")
        })

        it("Should fail if the contract name is not valid", async () => {
            const fun = () => getContractAddress("hello" as any)

            expect(fun).toThrow("You must specify a valid contract name")
        })
    })

    describe("# getContractInstance", () => {
        it("Should not return a contract instance if the contract name is not valid", async () => {
            const fun = () => getContractInstance("hello" as any, ethers.constants.AddressZero)

            expect(fun).toThrow("contract does not exist")
        })

        it("Should return a Groups contract instance", async () => {
            const expectedValue = getContractInstance(ContractName.INTEREP, ethers.constants.AddressZero)

            expect(expectedValue).toBeInstanceOf(Contract)
        })
    })

    describe("# getNetworkFullName", () => {
        it("Should return the Ethereum mainnet network name", async () => {
            const expectedValue = getNetworkFullName(1)

            expect(expectedValue).toBe("Ethereum Mainnet")
        })
    })
})
