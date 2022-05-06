import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree"
import { merkleTreeDepths } from "src/config"
import { Provider } from "src/types/groups"
import poseidon from "./poseidon"

/**
 * Creates an incremental Merkle tree with static tree depth and zero value.
 * @returns The tree instance.
 */
export default function createIncrementalMerkleTree(provider: Provider): IncrementalMerkleTree {
    return new IncrementalMerkleTree((nodes) => poseidon(...nodes), merkleTreeDepths[provider], BigInt(0), 2)
}
