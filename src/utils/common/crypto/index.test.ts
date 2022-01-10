import { MerkleTree } from "@interrep/merkle-tree"
import { createMerkleTree, defaultMerkleTreeRoot } from "."
import { encryptMessage, encryptMessageWithSalt } from "./encryptMessage"
import poseidon from "./poseidon"
import sha256 from "./sha256"

jest.mock("ethers", () => {
    const { ethers } = jest.requireActual("ethers")

    return {
        __esModule: true,
        ethers: {
            utils: {
                hexlify: ethers.utils.hexlify,
                randomBytes: jest.fn().mockReturnValue([63, 129, 117, 76, 129, 36, 152, 59, 179, 24, 0, 139])
            }
        }
    }
})

describe("# utils/common/crypto", () => {
    describe("# encryptMessage", () => {
        const pubKey = "C5YMNdqE4kLgxQhJO1MfuQcHP5hjVSXzamzd/TxlR0U="

        it("Should encrypt a message correctly", () => {
            const expectedValue = encryptMessage(pubKey, "Hello World")

            expect(expectedValue).toContain("0x7b227665727")
        })

        it("Should encrypt a message with salt correctly", () => {
            const expectedValue = encryptMessageWithSalt(pubKey, "Hello World")

            expect(expectedValue).toContain("0x7b227665727")
        })
    })

    describe("# poseidon", () => {
        it("Should hash two numbers correctly", () => {
            const expectedValue = poseidon(1, 2)

            expect(expectedValue).toContain("785320012077606")
        })
    })

    describe("# sha256", () => {
        it("Should hash a message correctly", () => {
            const expectedValue = sha256("Hello World")

            expect(expectedValue).toContain("a591a6d40bf420")
        })
    })

    describe("# createMerkleTree", () => {
        it("Should create a Merkle tree", () => {
            const expectedValue = createMerkleTree()

            expect(expectedValue).toBeInstanceOf(MerkleTree)
            expect(expectedValue.root).toContain("19217088683336")
        })

        it("Should import the right default Merkle tree root", () => {
            expect(defaultMerkleTreeRoot).toContain("19217088683336")
        })
    })
})
