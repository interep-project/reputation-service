import { Web2Provider } from "@interrep/reputation-criteria"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { addIdentityCommitment, getGroupId } from "src/core/groups"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function addWeb2IdentityCommitmentController(
    req: NextApiRequest,
    res: NextApiResponse,
    provider: Web2Provider
) {
    const name = req.query?.name
    const identityCommitment = req.query?.identityCommitment
    const { web2AccountId } = JSON.parse(req.body)

    if (
        !name ||
        typeof name !== "string" ||
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

        const groupId = getGroupId(provider, name as any)

        logger.silly(`Adding identity commitment ${identityCommitment} to the tree of the group ${groupId}`)

        const web2Account = await Web2Account.findById(web2AccountId)

        if (!web2Account) {
            throw new Error(`Web 2 account not found`)
        }

        if (web2Account.provider !== provider) {
            throw new Error("Web 2 account doesn't have the right provider")
        }

        if (!web2Account.basicReputation || web2Account.basicReputation !== name) {
            throw new Error("Web 2 account doesn't have the right reputation")
        }

        if (web2Account.hasJoinedAGroup) {
            throw new Error(`Web 2 account already joined a ${provider} group`)
        }

        const rootHash = await addIdentityCommitment(provider, name, identityCommitment)

        web2Account.hasJoinedAGroup = true

        await web2Account.save()

        return res.status(201).send({ data: rootHash.toString() })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
