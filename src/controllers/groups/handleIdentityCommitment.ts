import { MerkleTreeNode } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { checkGroup } from "src/core/groups"
import { GroupName, Provider } from "src/types/groups"
import { getCors, logger, runAPIMiddleware } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"
import handleEmailIdentityCommitmentController from "./handleEmailIdentityCommitment"
import handleOAuthIdentityCommitmentController from "./handleOAuthIdentityCommitment"
import handlePoapIdentityCommitmentController from "./handlePoapIdentityCommitment"
import handleTelegramIdentityCommitmentController from "./handleTelegramIdentityCommitment"

export default async function handleIdentityCommitmentController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST" && req.method !== "DELETE" && req.method !== "GET") {
        res.status(405).end()
        return
    }

    const provider = req.query?.provider as Provider
    const name = req.query?.name as GroupName
    const identityCommitment = req.query?.identityCommitment as string

    if (
        !provider ||
        typeof provider !== "string" ||
        !name ||
        typeof name !== "string" ||
        !identityCommitment ||
        typeof identityCommitment !== "string"
    ) {
        res.status(400).end()
        return
    }

    if (!checkGroup(provider, name)) {
        res.status(404).end("The group does not exist")
        return
    }

    if (req.method === "GET") {
        try {
            await connectDatabase()

            const leaf = await MerkleTreeNode.findByGroupAndHash({ name, provider }, identityCommitment)

            res.status(200).send({ data: !!leaf && leaf.level === 0 })
        } catch (error) {
            res.status(500).end()

            logger.error(error)
        }

        return
    }

    try {
        await runAPIMiddleware(req, res, getCors())
    } catch (error: any) {
        res.status(401).send(error.message)

        logger.error(error)

        return
    }

    console.log(res.getHeader("Access-Control-Allow-Origin"))

    switch (provider) {
        case "poap":
            await handlePoapIdentityCommitmentController(req, res)
            break
        case "telegram":
            await handleTelegramIdentityCommitmentController(req, res)
            break
        case "email":
            await handleEmailIdentityCommitmentController(req, res)
            break
        default:
            await handleOAuthIdentityCommitmentController(req, res)
    }

    if (req.method === "POST") {
        logger.info(`[${req.url}] The identity commitment has been added to the group`)
    } else {
        logger.info(`[${req.url}] The identity commitment has been deleted from the group`)
    }
}
