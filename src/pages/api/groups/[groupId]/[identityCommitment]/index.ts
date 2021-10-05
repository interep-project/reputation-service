import { withSentry } from "@sentry/nextjs"
import { ethers } from "ethers"
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { ContractName } from "src/config"
import MerkleTreeController from "src/controllers/MerkleTreeController"
import { getPoapGroupIdsByAddress, PoapGroupId } from "src/core/groups/poap"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import getBackendContractInstance from "src/utils/crypto/getBackendContractInstance"
import getContractAddress from "src/utils/crypto/getContractAddress"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    await dbConnect()

    if (req.method !== "POST") {
        return res.status(405).end()
    }

    const groupId = req.query?.groupId
    const identityCommitment = req.query?.identityCommitment
    const { web2AccountId, userSignature, userAddress } = JSON.parse(req.body)

    if (
        (!web2AccountId && !(userSignature && userAddress)) ||
        !identityCommitment ||
        typeof identityCommitment !== "string" ||
        !groupId ||
        typeof groupId !== "string"
    ) {
        return res.status(400).end()
    }

    if (web2AccountId) {
        const session = await getSession({ req })

        if (!session) {
            return res.status(401).end()
        }

        if (session.web2AccountId !== web2AccountId) {
            return res.status(403).end()
        }

        try {
            const web2Account = await Web2Account.findById(web2AccountId)

            if (!web2Account) {
                throw new Error(`Web 2 account not found`)
            }

            if (
                !web2Account.basicReputation ||
                `${web2Account.provider.toString().toUpperCase()}_${web2Account.basicReputation}` !== groupId
            ) {
                throw new Error("The group id does not match the web 2 account reputation")
            }

            if (web2Account.hasJoinedAGroup) {
                throw new Error(`Web 2 account already joined a ${web2Account.provider} group`)
            }

            logger.silly(`Adding identity commitment ${identityCommitment} to the tree of the group ${groupId}`)

            // Get the value of the next root hash without saving anything in the db.
            const rootHash = await MerkleTreeController.previewNewRoot(groupId, identityCommitment)

            // Update the contract with new root.
            const contractAddress = getContractAddress(ContractName.INTERREP_GROUPS)
            const contractInstance = await getBackendContractInstance(ContractName.INTERREP_GROUPS, contractAddress)

            await contractInstance.addRootHash(ethers.utils.formatBytes32String(groupId), identityCommitment, rootHash)

            // Update the db with the new merkle tree.
            await MerkleTreeController.appendLeaf(groupId, identityCommitment)

            web2Account.hasJoinedAGroup = true

            await web2Account.save()

            return res.status(201).send({ data: rootHash.toString() })
        } catch (error) {
            logger.error(error)

            return res.status(500).end()
        }
    }

    try {
        if (ethers.utils.verifyMessage(identityCommitment, userSignature) !== userAddress) {
            throw new Error(`The signature is not valid`)
        }

        const poapGroupIds = await getPoapGroupIdsByAddress(userAddress)

        if (!poapGroupIds.includes(groupId as PoapGroupId)) {
            throw new Error(`The address does not hold the group POAP token`)
        }

        logger.silly(`Adding identity commitment ${identityCommitment} to the tree of the group ${groupId}`)

        // Get the value of the next root hash without saving anything in the db.
        const rootHash = await MerkleTreeController.previewNewRoot(groupId, identityCommitment)

        // Update the contract with new root.
        const contractAddress = getContractAddress(ContractName.INTERREP_GROUPS)
        const contractInstance = await getBackendContractInstance(ContractName.INTERREP_GROUPS, contractAddress)

        await contractInstance.addRootHash(ethers.utils.formatBytes32String(groupId), identityCommitment, rootHash)

        // Update the db with the new merkle tree.
        await MerkleTreeController.appendLeaf(groupId, identityCommitment)

        return res.status(201).send({ data: rootHash.toString() })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}

export default withSentry(handler as NextApiHandler)
