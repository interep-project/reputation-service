import { Model, Document } from "mongoose"
import { Group } from "src/types/groups"
import {
    findByLevelAndIndex,
    findByGroupAndHash,
    findZeroes,
    getNumberOfNodes,
    findByGroupProviderAndHash,
    getGroupNamesByProvider
} from "./MerkleTree.statics"

export interface IMerkleTreeNode {
    group: Omit<Group, "size">
    level: number
    index: number
    parent?: IMerkleTreeNode // Root node has no parent.
    siblingHash?: string // Root has no sibling.
    hash: string
}

export interface IMerkleTreeNodeDocument extends IMerkleTreeNode, Document {}

export interface IMerkleTreeNodeModel extends Model<IMerkleTreeNodeDocument> {
    findByLevelAndIndex: typeof findByLevelAndIndex
    findByGroupAndHash: typeof findByGroupAndHash
    findByGroupProviderAndHash: typeof findByGroupProviderAndHash
    getGroupNamesByProvider: typeof getGroupNamesByProvider
    getNumberOfNodes: typeof getNumberOfNodes
}

export interface IMerkleTreeZero {
    level: number
    hash: string
}

export interface IMerkleTreeZeroDocument extends IMerkleTreeZero, Document {}

export interface IMerkleTreeZeroModel extends Model<IMerkleTreeZeroDocument> {
    findZeroes: typeof findZeroes
}
