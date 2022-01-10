import { MerkleTree } from "@interrep/merkle-tree"
import { createMerkleTree, defaultMerkleTreeRoot } from "."
import poseidon from "./poseidon"
import sha256 from "./sha256"

describe("# utils/common/crypto", () => {
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
