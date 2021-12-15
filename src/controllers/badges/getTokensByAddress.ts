import { Token } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { updateTokenStatus } from "src/core/badges"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"
import { getChecksummedAddress } from "src/utils/common/crypto"

export default async function getTokensByAddressController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const userAddress = req.query?.userAddress

    if (!userAddress || typeof userAddress !== "string") {
        return res.status(400).end()
    }

    const ownerChecksummedAddress = getChecksummedAddress(userAddress)

    if (!ownerChecksummedAddress) {
        return res.status(400).send("Invalid address")
    }

    try {
        await dbConnect()

        const tokens = await Token.findByUserAddress(ownerChecksummedAddress)

        await updateTokenStatus(tokens)

        return res.status(200).send({ data: tokens.map((token) => token.toJSON()) })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
