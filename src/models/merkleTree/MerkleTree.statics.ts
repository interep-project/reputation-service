import { Group, Provider } from "src/types/groups"
import { MerkleTreeNode, MerkleTreeZero } from "./MerkleTree.model"
import { IMerkleTreeNodeDocument, IMerkleTreeZeroDocument } from "./MerkleTree.types"

export async function findByLevelAndIndex(
    this: typeof MerkleTreeNode,
    level: number,
    index: number
): Promise<IMerkleTreeNodeDocument | null> {
    return this.findOne({ level, index }).populate("parent")
}

export async function findByGroupAndHash(
    this: typeof MerkleTreeNode,
    group: Omit<Group, "size">,
    hash: string
): Promise<IMerkleTreeNodeDocument | null> {
    return this.findOne({ "group.provider": group.provider, "group.name": group.name, hash }).populate("parent")
}

export async function findByGroupProviderAndHash(
    this: typeof MerkleTreeNode,
    groupProvider: Provider,
    hash: string
): Promise<IMerkleTreeNodeDocument | null> {
    return this.findOne({ "group.provider": groupProvider, hash }).populate("parent")
}

export async function getGroupNamesByProvider(this: typeof MerkleTreeNode, provider: Provider): Promise<string[]> {
    return this.distinct("group.name", { "group.provider": provider })
}

export async function getNumberOfNodes(
    this: typeof MerkleTreeNode,
    group: Omit<Group, "size">,
    level: number
): Promise<number> {
    return this.countDocuments({ "group.provider": group.provider, "group.name": group.name, level })
}

export async function findZeroes(this: typeof MerkleTreeZero): Promise<IMerkleTreeZeroDocument[] | null> {
    return this.find()
}
