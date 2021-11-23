import Cors from "cors"
import { NextApiRequest, NextApiResponse } from "next"
import config from "src/config"
import { getProviders } from "src/core/groups"
import { Provider, Web3Provider } from "src/types/groups"
import apiMiddleware from "src/utils/backend/apiMiddleware"
import logger from "src/utils/backend/logger"
import handlePoapIdentityCommitmentController from "./handlePoapIdentityCommitment"
import handleTelegramIdentityCommitmentController from "./handleTelegramIdentityCommitment"
import handleOAuthIdentityCommitmentController from "./handleOAuthIdentityCommitment"

export default async function handleIdentityCommitmentController(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    try {
        await apiMiddleware(Cors({ origin: config.API_WHITELIST }))(req, res)
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }

    if (req.method !== "POST" && req.method !== "DELETE") {
        return res.status(405).end()
    }

    const provider = req.query?.provider

    if (!provider || typeof provider !== "string") {
        return res.status(400).end()
    }

    const providers = getProviders()

    if (!providers.includes(provider as Provider)) {
        return res.status(400).end()
    }

    switch (provider) {
        case Web3Provider.POAP:
            return handlePoapIdentityCommitmentController(req, res)
        case "telegram":
            return handleTelegramIdentityCommitmentController(req, res)
        default:
            return handleOAuthIdentityCommitmentController(req, res)
    }
}
