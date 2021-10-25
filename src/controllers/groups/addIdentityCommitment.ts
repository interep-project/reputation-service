import { Web2Provider } from "@interrep/reputation-criteria"
import Cors from "cors"
import { NextApiRequest, NextApiResponse } from "next"
import config from "src/config"
import { Web3Provider } from "src/types/groups"
import apiMiddleware from "src/utils/backend/apiMiddleware"
import logger from "src/utils/backend/logger"
import addPoapIdentityCommitmentController from "./addPoapIdentityCommitment"
import addTelegramIdentityCommitmentController from "./addTelegramIdentityCommitment"
import addWeb2IdentityCommitmentController from "./addWeb2IdentityCommitment"

export default async function addIdentityCommitmentController(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    try {
        await apiMiddleware(Cors({ origin: config.API_WHITELIST }))(req, res)
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }

    if (req.method !== "POST") {
        return res.status(405).end()
    }

    const provider = req.query?.provider

    if (!provider || typeof provider !== "string") {
        return res.status(400).end()
    }

    switch (provider) {
        case Web3Provider.POAP:
            return addPoapIdentityCommitmentController(req, res)
        case "telegram":
            return addTelegramIdentityCommitmentController(req, res)
        default:
            return addWeb2IdentityCommitmentController(req, res, provider as Web2Provider)
    }
}
