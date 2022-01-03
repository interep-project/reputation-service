import { MerkleTree } from "@interrep/merkle-tree"
import config from "src/config"
import poseidon from "./poseidon"

/**
 * Creates a Merkle tree with static tree depth and zero value.
 * @returns The Merkle tree instance.
 */
export default function createMerkleTree(): MerkleTree {
    return new MerkleTree((nodes) => poseidon(...nodes), config.MERKLE_TREE_DEPTH, BigInt(0))
}

export const defaultMerkleTreeRoot = createMerkleTree().root
