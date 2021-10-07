import { ethers } from "ethers"
import { NextApiRequest, NextApiResponse } from "next"
import { ContractName } from "src/config"
import { getGroupId } from "src/core/groups"
import { appendLeaf, previewNewRoot } from "src/core/groups/mts"
import { getPoapGroupNamesByAddress, PoapGroupName } from "src/core/groups/poap"
import { Web3Provider } from "src/types/groups"
import { dbConnect } from "src/utils/backend/database"
import getBackendContractInstance from "src/utils/backend/getBackendContractInstance"
import logger from "src/utils/backend/logger"
import getContractAddress from "src/utils/common/getContractAddress"

export default async function addPoapIdentityCommitmentController(req: NextApiRequest, res: NextApiResponse) {
    const reputationOrName = req.query?.reputationOrName
    const identityCommitment = req.query?.identityCommitment
    const { userSignature, userAddress } = JSON.parse(req.body)

    if (
        !reputationOrName ||
        typeof reputationOrName !== "string" ||
        !identityCommitment ||
        typeof identityCommitment !== "string" ||
        !userSignature ||
        !userAddress
    ) {
        return res.status(400).end()
    }

    try {
        if (ethers.utils.verifyMessage(identityCommitment, userSignature) !== userAddress) {
            throw new Error(`The signature is not valid`)
        }

        const groupId = getGroupId(Web3Provider.POAP, reputationOrName as any)
        const userPoapGroupNames = await getPoapGroupNamesByAddress(userAddress)

        if (!userPoapGroupNames.includes(reputationOrName as PoapGroupName)) {
            throw new Error(`The address does not hold the group POAP token`)
        }

        await dbConnect()

        logger.silly(`Adding identity commitment ${identityCommitment} to the tree of the group ${groupId}`)

        // Get the value of the next root hash without saving anything in the db.
        const rootHash = await previewNewRoot(Web3Provider.POAP, reputationOrName as any, identityCommitment)

        // Update the contract with new root.
        const contractAddress = getContractAddress(ContractName.INTERREP_GROUPS)
        const contractInstance = await getBackendContractInstance(ContractName.INTERREP_GROUPS, contractAddress)

        await contractInstance.addRootHash(ethers.utils.formatBytes32String(groupId), identityCommitment, rootHash)

        // Update the db with the new merkle tree.
        await appendLeaf(Web3Provider.POAP, reputationOrName as any, identityCommitment)

        return res.status(201).send({ data: rootHash.toString() })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
