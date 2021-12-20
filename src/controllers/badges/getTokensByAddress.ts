import { Token } from "@interrep/db"
import { utils } from "ethers"
import { NextApiRequest, NextApiResponse } from "next"
import { updateTokenStatus } from "src/core/badges"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function getTokensByAddressController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const userAddress = req.query?.userAddress

    if (!userAddress || typeof userAddress !== "string") {
        res.status(400).end()
        return
    }

    if (!utils.isAddress(userAddress)) {
        res.status(400).send("The user address is not valid")
        return
    }

    try {
        await dbConnect()

        const tokens = await Token.findByUserAddress(userAddress)

        await updateTokenStatus(tokens)

        res.status(200).send({ data: tokens.map((token) => token.toJSON()) })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
