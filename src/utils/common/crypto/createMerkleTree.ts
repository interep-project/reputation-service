import { MerkleTree } from "@interrep/merkle-tree"
import config from "src/config"
import poseidon from "./poseidon"

export default function createMerkleTree(): MerkleTree {
    return new MerkleTree((nodes) => poseidon(...nodes), config.MERKLE_TREE_DEPTH, BigInt(0))
}

export const defaultMerkleTreeRoot = createMerkleTree().root
