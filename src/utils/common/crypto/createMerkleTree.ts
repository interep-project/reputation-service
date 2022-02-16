import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree"
import config from "src/config"
import poseidon from "./poseidon"

/**
 * Creates an incremental Merkle tree with static tree depth and zero value.
 * @returns The tree instance.
 */
export default function createIncrementalMerkleTree(): IncrementalMerkleTree {
    return new IncrementalMerkleTree((nodes) => poseidon(...nodes), config.MERKLE_TREE_DEPTH, BigInt(0), 2)
}

export const defaultIncrementalMerkleTreeRoot = createIncrementalMerkleTree().root
