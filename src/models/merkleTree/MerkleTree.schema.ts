import { Schema } from "mongoose"
import { findByLevelAndIndex, findByGroupIdAndHash, findZeroes, getNumberOfNodes } from "./MerkleTree.statics"
import {
    IMerkleTreeNode,
    IMerkleTreeNodeDocument,
    IMerkleTreeNodeModel,
    IMerkleTreeZero,
    IMerkleTreeZeroModel,
    IMerkleTreeZeroDocument
} from "./MerkleTree.types"

// Node
const MerkleTreeNodeSchemaFields: Record<keyof IMerkleTreeNode, any> = {
    key: {
        groupId: String,
        level: Number,
        index: Number
    },
    parent: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: "MerkleTreeNode"
    },
    siblingHash: String,
    hash: String
}

export const MerkleTreeNodeSchema = new Schema<IMerkleTreeNodeDocument, IMerkleTreeNodeModel>(
    MerkleTreeNodeSchemaFields
)

MerkleTreeNodeSchema.statics.findByLevelAndIndex = findByLevelAndIndex
MerkleTreeNodeSchema.statics.findByGroupIdAndHash = findByGroupIdAndHash
MerkleTreeNodeSchema.statics.getNumberOfNodes = getNumberOfNodes

// Zeroes
export const MerkleTreeZeroSchemaFields: Record<keyof IMerkleTreeZero, any> = {
    level: { type: Number, unique: true },
    hash: String
}

export const MerkleTreeZeroSchema = new Schema<IMerkleTreeZeroDocument, IMerkleTreeZeroModel>(
    MerkleTreeZeroSchemaFields
)

MerkleTreeZeroSchema.statics.findZeroes = findZeroes
