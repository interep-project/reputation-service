import { calculateReputation, OAuthProvider } from "@interrep/reputation-criteria"
import { withSentry } from "@sentry/nextjs"
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { getTwitterParametersByUsername } from "src/core/reputation/twitter"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    await dbConnect()

    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const provider = req.query?.provider
    const username = req.query?.username

    if (!provider || typeof provider !== "string" || !username || typeof username !== "string") {
        return res.status(400).end()
    }

    try {
        const data: any = {}

        switch (provider) {
            case "twitter":
                data.parameters = await getTwitterParametersByUsername(username)
                data.reputation = calculateReputation(OAuthProvider.TWITTER, data.parameters)

                break
            default:
                return res.status(404).end()
        }

        return res.status(200).send({
            data
        })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}

export default withSentry(handler as NextApiHandler)
