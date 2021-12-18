import { Token } from "@interrep/db"
import { utils } from "ethers"
import { NextApiRequest, NextApiResponse } from "next"
import { updateTokenStatus } from "src/core/badges"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getTokensByAddressController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const userAddress = req.query?.userAddress

    if (!userAddress || typeof userAddress !== "string" || !utils.isAddress(userAddress)) {
        return res.status(400).end()
    }

    try {
        await dbConnect()

        const tokens = await Token.findByUserAddress(userAddress)

        await updateTokenStatus(tokens)

        return res.status(200).send({ data: tokens.map((token) => token.toJSON()) })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
