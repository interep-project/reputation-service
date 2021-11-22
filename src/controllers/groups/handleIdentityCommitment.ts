import { OAuthProvider } from "@interrep/reputation-criteria"
import Cors from "cors"
import { NextApiRequest, NextApiResponse } from "next"
import config from "src/config"
import { getProviders } from "src/core/groups"
import { Provider, Web3Provider } from "src/types/groups"
import apiMiddleware from "src/utils/backend/apiMiddleware"
import logger from "src/utils/backend/logger"
import addOAuthIdentityCommitmentController from "./addOAuthIdentityCommitment"
import addPoapIdentityCommitmentController from "./addPoapIdentityCommitment"
import addTelegramIdentityCommitmentController from "./addTelegramIdentityCommitment"
import deleteTelegramIdentityCommitmentController from "./deleteTelegramIdentityCommitment"

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

    const provider = req.query?.provider

    if (!provider || typeof provider !== "string") {
        return res.status(400).end()
    }

    const providers = getProviders()

    if (!providers.includes(provider as Provider)) {
        return res.status(400).end()
    }

    switch (req.method) {
        case "POST":
            switch (provider) {
                case Web3Provider.POAP:
                    return addPoapIdentityCommitmentController(req, res)
                case "telegram":
                    return addTelegramIdentityCommitmentController(req, res)
                default:
                    return addOAuthIdentityCommitmentController(req, res, provider as OAuthProvider)
            }
        case "DELETE":
            switch (provider) {
                case "telegram":
                    return deleteTelegramIdentityCommitmentController(req, res)
                default:
                    return res.status(501).end()
            }
        default:
            return res.status(405).end()
    }
}
