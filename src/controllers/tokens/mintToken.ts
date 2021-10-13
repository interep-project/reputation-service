import { NextApiRequest, NextApiResponse } from "next"
import mintToken from "src/core/linking/mintToken"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function mintTokenController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
        return res.status(405).end()
    }

    const tokenId = req.query?.tokenId

    if (!tokenId || typeof tokenId !== "string") {
        return res.status(400).end()
    }

    try {
        await dbConnect()

        const txResponse = await mintToken(tokenId)

        return res.status(200).send({ data: txResponse })
    } catch (error) {
        logger.error(error)

        return res.status(500).send(error)
    }
}
