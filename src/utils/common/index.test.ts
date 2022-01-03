import { OAuthProvider } from "@interrep/reputation"
import { Contract, ethers } from "ethers"
import { ContractName } from "src/config"
import { getNetworkFullName } from "."
import capitalize from "./capitalize"
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

    describe("# delay", () => {
        it("Should create a delay promise", async () => {
            expect(delay).not.toThrow()
        })
    })

    describe("# getContractAddress", () => {
        it("Should return a Groups contract address", async () => {
            const expectedValue = getContractAddress(ContractName.GROUPS)

            expect(expectedValue).toContain("0x")
        })

        it("Should not return a ReputationBadge contract address if there is no provider", async () => {
            const fun = () => getContractAddress(ContractName.REPUTATION_BADGE)

            expect(fun).toThrow("You must specify a OAuth provider")
        })

        it("Should return a ReputationBadge contract address", async () => {
            const expectedValue = getContractAddress(ContractName.REPUTATION_BADGE, OAuthProvider.GITHUB)

            expect(expectedValue).toContain("0x")
        })
    })

    describe("# getContractInstance", () => {
        it("Should not return a contract instance if the contract name is wrong", async () => {
            const fun = () => getContractInstance("hello" as any, ethers.constants.AddressZero)

            expect(fun).toThrow("contract does not exist")
        })

        it("Should return a Groups contract instance", async () => {
            const expectedValue = getContractInstance(ContractName.GROUPS, ethers.constants.AddressZero)

            expect(expectedValue).toBeInstanceOf(Contract)
        })

        it("Should return a ReputationBadge contract instance", async () => {
            const expectedValue = getContractInstance(ContractName.REPUTATION_BADGE, ethers.constants.AddressZero)

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
