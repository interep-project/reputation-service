import { Web2Provider } from "@interrep/reputation-criteria"
import { ethers } from "ethers"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { ContractName } from "src/config"
import { getGroupId } from "src/core/groups"
import { appendLeaf, previewNewRoot } from "src/core/groups/mts"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import { dbConnect } from "src/utils/backend/database"
import getBackendContractInstance from "src/utils/backend/getBackendContractInstance"
import logger from "src/utils/backend/logger"
import getContractAddress from "src/utils/common/getContractAddress"

export default async function addWeb2IdentityCommitmentController(
    req: NextApiRequest,
    res: NextApiResponse,
    provider: Web2Provider
) {
    const reputationOrName = req.query?.reputationOrName
    const identityCommitment = req.query?.identityCommitment
    const { web2AccountId } = JSON.parse(req.body)

    if (
        !reputationOrName ||
        typeof reputationOrName !== "string" ||
        !identityCommitment ||
        typeof identityCommitment !== "string" ||
        !web2AccountId
    ) {
        return res.status(400).end()
    }

    const session = await getSession({ req })

    if (!session) {
        return res.status(401).end()
    }

    if (session.web2AccountId !== web2AccountId) {
        return res.status(403).end()
    }

    try {
        await dbConnect()

        const groupId = getGroupId(provider, reputationOrName as any)

        logger.silly(`Adding identity commitment ${identityCommitment} to the tree of the group ${groupId}`)

        const web2Account = await Web2Account.findById(web2AccountId)

        if (!web2Account) {
            throw new Error(`Web 2 account not found`)
        }

        if (web2Account.provider !== provider) {
            throw new Error("Web 2 account doesn't have the right provider")
        }

        if (!web2Account.basicReputation || web2Account.basicReputation !== reputationOrName) {
            throw new Error("Web 2 account doesn't have the right reputation")
        }

        if (web2Account.hasJoinedAGroup) {
            throw new Error(`Web 2 account already joined a ${provider} group`)
        }

        // Get the value of the next root hash without saving anything in the db.
        const rootHash = await previewNewRoot(provider, reputationOrName as any, identityCommitment)

        // Update the contract with new root.
        const contractAddress = getContractAddress(ContractName.INTERREP_GROUPS)
        const contractInstance = await getBackendContractInstance(ContractName.INTERREP_GROUPS, contractAddress)

        await contractInstance.addRootHash(ethers.utils.formatBytes32String(groupId), identityCommitment, rootHash)

        // Update the db with the new merkle tree.
        await appendLeaf(provider, reputationOrName as any, identityCommitment)

        web2Account.hasJoinedAGroup = true

        await web2Account.save()

        return res.status(201).send({ data: rootHash.toString() })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
