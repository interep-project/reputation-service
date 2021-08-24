import { MerkleTreeLeaf, MerkleTreeNode, MerkleTreeZero } from '../models/merkleTree/MerkleTree.model';
import { IMerkleTreeNodeDocument } from '../models/merkleTree/MerkleTree.types';
import MimcSpongeHash from '../utils/crypto/hasher';
import config from '../config';

class MerkleTreeController {
    public appendLeaf = async (groupId: string, idCommitment: string): Promise<any> => {
        // Get the zero hashes
        const zeroes = await MerkleTreeZero.findZeroes();

        // Add a leaf. Don't add to DB yet
        const leaf = await MerkleTreeLeaf.create({ groupId, nodeId: null, idCommitment });
        let hash = MimcSpongeHash(idCommitment, idCommitment); // TODO check method for 1 arg

        // Get next available index at level 0
        let index = await this.getNextIndex(/* groupId,*/ 0);
        // TODO - need to handle a full tree?

        let prevNode: IMerkleTreeNodeDocument;
        let prevIndex: number;
        // Iterate up to root
        for (let level = 0; level < config.TREE_LEVELS; level++) {
            let node: IMerkleTreeNodeDocument;
            if (level == 0) {
                // always create the leaf node
                node = await MerkleTreeNode.create({ 
                    key: { groupId, level, index },
                    hash
                });
                leaf.nodeId = node.id;                
                await leaf.save();
            } else {
                index = Math.floor(prevIndex / 2);
                if (index % 2 == 0) {
                    // left node
                    // hash with zero hash for this level
                    hash = MimcSpongeHash(hash, zeroes[level].hash);
                    // create new node
                    node = await MerkleTreeNode.create({ 
                        key: { groupId, level, index },
                        hash
                    });
    
                } else {
                    // right node
                    // hash with left sibling from previous level
                    const sibling = await MerkleTreeNode.findByLevelAndIndex({
                        // key
                        groupId, 
                        level: level - 1, 
                        index: prevIndex - 1
                    });
                    hash = MimcSpongeHash(sibling.hash, hash);
                    // update existing node
                    node = await MerkleTreeNode.findByLevelAndIndex({
                        groupId,
                        level,
                        index
                    });
                    node.hash = hash;
                }
                prevNode.parent = node.id;
                await prevNode.save();
            }
            prevIndex = index;
            prevNode = node;
        }
        // Update contract with new root
        
    }

    // public updateLeaf = async (groupId: string, idCommitment: string): Promise<any> => {
    //     // update leaf
    //     // Get index
    //     // Update hash
    //     // Iterate up to root
    //     // Update contract with new root
    // }

    // public getPath = async (groupId: string, idCommitment: string): Promise<string[]> => {
    //     // find leaf
    //     // get path starting from leaf node
    //     return [];
    // }

    // public getPathByIndex = async (groupId: string, index: number): Promise<string[]> => {
    //     // get path and return array
    //     return [];
    // }

    public getNextIndex = async (/*groupId: string,*/ level: number): Promise<number> => {
        // Count entries at the given level

        // Increment and return.
        return level;
    }
}

export default new MerkleTreeController();