import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { withSentry } from "@sentry/nextjs"
import TwitterAccountController from "src/controllers/TwitterAccountController"
import { dbConnect } from "src/utils/server/database"

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    await dbConnect()

    if (req.method !== "GET") {
        return res.status(405).end()
    }

    return TwitterAccountController.getTwitterReputation(req, res)
}

export default withSentry(handler as NextApiHandler)
