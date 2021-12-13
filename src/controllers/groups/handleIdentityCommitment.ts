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

export default async function handleIdentityCommitmentController(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    if (req.method !== "POST" && req.method !== "DELETE" && req.method !== "GET") {
        return res.status(405).end()
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
        return res.status(400).end()
    }

    if (!checkGroup(provider as Provider, name)) {
        return res.status(404).end("The group does not exist")
    }

    if (req.method === "GET") {
        try {
            await dbConnect()

            const leaf = await MerkleTreeNode.findByGroupAndHash({ name, provider }, identityCommitment)

            return res.status(200).send({ data: !!leaf && leaf.level === 0 })
        } catch (error) {
            logger.error(error)

            return res.status(500).end()
        }
    }

    try {
        await apiMiddleware(Cors({ origin: config.API_WHITELIST }))(req, res)
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }

    switch (provider) {
        case Web3Provider.POAP:
            return handlePoapIdentityCommitmentController(req, res)
        case "telegram":
            return handleTelegramIdentityCommitmentController(req, res)
        case "email":
            return handleEmailIdentityCommitmentController(req, res)
        default:
            return handleOAuthIdentityCommitmentController(req, res)
    }
}
