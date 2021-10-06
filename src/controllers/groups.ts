import Cors from "cors"
import { ethers } from "ethers"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import config, { ContractName } from "src/config"
import { getGroup, getGroups } from "src/core/groups"
import { appendLeaf, previewNewRoot, retrievePath } from "src/core/groups/mts"
import { getPoapGroupIdsByAddress, PoapGroupId } from "src/core/groups/poap"
import { MerkleTreeNode } from "src/models/merkleTree/MerkleTree.model"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import apiMiddleware from "src/utils/backend/apiMiddleware"
import { dbConnect } from "src/utils/backend/database"
import getBackendContractInstance from "src/utils/backend/getBackendContractInstance"
import logger from "src/utils/backend/logger"
import getContractAddress from "src/utils/common/getContractAddress"

class GroupsController {
    static async web2AccountHasJoinedAGroup(req: NextApiRequest, res: NextApiResponse): Promise<void> {
        if (req.method !== "GET") {
            return res.status(405).end()
        }

        const session = await getSession({ req })

        if (!session) {
            return res.status(401).end()
        }

        try {
            await dbConnect()

            const web2Account = await Web2Account.findById(session.web2AccountId)

            if (!web2Account) {
                return res.status(500).send("Can't find web 2 account")
            }

            return res.status(200).send({ data: !!web2Account.hasJoinedAGroup })
        } catch (error) {
            logger.error(error)

            return res.status(500).end()
        }
    }

    static async getGroups(req: NextApiRequest, res: NextApiResponse): Promise<void> {
        if (req.method !== "GET") {
            return res.status(405).end()
        }

        try {
            await dbConnect()

            const groups = await getGroups()

            return res.status(200).send({ data: groups })
        } catch (error) {
            logger.error(error)

            return res.status(500).end()
        }
    }

    static async getGroup(req: NextApiRequest, res: NextApiResponse): Promise<void> {
        if (req.method !== "GET") {
            return res.status(405).end()
        }

        const groupId = req.query?.groupId

        if (!groupId || typeof groupId !== "string") {
            return res.status(400).end()
        }

        try {
            await dbConnect()

            const group = await getGroup(groupId)

            return res.status(200).send({ data: group })
        } catch (error) {
            logger.error(error)

            return res.status(500).end()
        }
    }

    static async groupHasIdentityCommitment(req: NextApiRequest, res: NextApiResponse): Promise<void> {
        if (req.method !== "GET") {
            return res.status(405).end()
        }

        const groupId = req.query?.groupId
        const identityCommitment = req.query?.identityCommitment

        if (!groupId || typeof groupId !== "string" || !identityCommitment || typeof identityCommitment !== "string") {
            return res.status(400).end()
        }

        try {
            await dbConnect()

            const node = await MerkleTreeNode.findByGroupIdAndHash(groupId, identityCommitment)

            return res.status(200).send({ data: !!node && node.key.level === 0 })
        } catch (error) {
            logger.error(error)

            return res.status(500).end()
        }
    }

    static async getMerkleTreePath(req: NextApiRequest, res: NextApiResponse): Promise<void> {
        if (req.method !== "GET") {
            return res.status(405).end()
        }

        const groupId = req.query?.groupId
        const identityCommitment = req.query?.identityCommitment

        if (!groupId || typeof groupId !== "string" || !identityCommitment || typeof identityCommitment !== "string") {
            return res.status(400).end()
        }

        try {
            await dbConnect()

            if (!(await MerkleTreeNode.findByGroupIdAndHash(groupId, identityCommitment))) {
                return res.status(404).send("The identity commitment does not exist")
            }

            const path = await retrievePath(groupId, identityCommitment)

            if (!path) {
                return res.status(200).send({ data: [] })
            }

            return res.status(200).send({ data: path })
        } catch (error) {
            logger.error(error)

            return res.status(500).end()
        }
    }

    static async addIdentityCommitment(req: NextApiRequest, res: NextApiResponse): Promise<void> {
        try {
            await apiMiddleware(Cors({ origin: config.API_WHITELIST }))(req, res)
        } catch (error) {
            logger.error(error)

            return res.status(500).end()
        }

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
                await dbConnect()

                logger.silly(`Adding identity commitment ${identityCommitment} to the tree of the group ${groupId}`)

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

                // Get the value of the next root hash without saving anything in the db.
                const rootHash = await previewNewRoot(groupId, identityCommitment)

                // Update the contract with new root.
                const contractAddress = getContractAddress(ContractName.INTERREP_GROUPS)
                const contractInstance = await getBackendContractInstance(ContractName.INTERREP_GROUPS, contractAddress)

                await contractInstance.addRootHash(
                    ethers.utils.formatBytes32String(groupId),
                    identityCommitment,
                    rootHash
                )

                // Update the db with the new merkle tree.
                await appendLeaf(groupId, identityCommitment)

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

            await dbConnect()

            logger.silly(`Adding identity commitment ${identityCommitment} to the tree of the group ${groupId}`)

            // Get the value of the next root hash without saving anything in the db.
            const rootHash = await previewNewRoot(groupId, identityCommitment)

            // Update the contract with new root.
            const contractAddress = getContractAddress(ContractName.INTERREP_GROUPS)
            const contractInstance = await getBackendContractInstance(ContractName.INTERREP_GROUPS, contractAddress)

            await contractInstance.addRootHash(ethers.utils.formatBytes32String(groupId), identityCommitment, rootHash)

            // Update the db with the new merkle tree.
            await appendLeaf(groupId, identityCommitment)

            return res.status(201).send({ data: rootHash.toString() })
        } catch (error) {
            logger.error(error)

            return res.status(500).end()
        }
    }
}

export default GroupsController
