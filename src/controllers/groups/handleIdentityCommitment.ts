import { MerkleTreeNode } from "@interrep/db"
import Cors from "cors"
import { NextApiRequest, NextApiResponse } from "next"
import config from "src/config"
import { checkGroup } from "src/core/groups"
import { Provider, Web3Provider } from "src/types/groups"
import apiMiddleware from "src/utils/backend/apiMiddleware"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"
import handleEmailIdentityCommitmentController from "./handleEmailIdentityCommitment"
import handleOAuthIdentityCommitmentController from "./handleOAuthIdentityCommitment"
import handlePoapIdentityCommitmentController from "./handlePoapIdentityCommitment"
import handleTelegramIdentityCommitmentController from "./handleTelegramIdentityCommitment"

export default async function handleIdentityCommitmentController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST" && req.method !== "DELETE" && req.method !== "GET") {
        res.status(405).end()
        return
    }

    const provider = req.query?.provider
    const name = req.query?.name
    const identityCommitment = req.query?.identityCommitment

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

    if (!checkGroup(provider as Provider, name)) {
        res.status(404).end("The group does not exist")
        return
    }

    if (req.method === "GET") {
        try {
            await dbConnect()

            const leaf = await MerkleTreeNode.findByGroupAndHash({ name, provider }, identityCommitment)

            res.status(200).send({ data: !!leaf && leaf.level === 0 })
        } catch (error) {
            res.status(500).end()

            logger.error(error)
        }

        return
    }

    try {
        await apiMiddleware(Cors({ origin: config.API_WHITELIST }))(req, res)
    } catch (error) {
        res.status(500).end()

        logger.error(error)

        return
    }

    switch (provider) {
        case Web3Provider.POAP:
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
