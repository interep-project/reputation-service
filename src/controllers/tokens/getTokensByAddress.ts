import { NextApiRequest, NextApiResponse } from "next"
import checkAndUpdateTokenStatus from "src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus"
import Token from "src/models/tokens/Token.model"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"
import getChecksummedAddress from "src/utils/common/crypto/getChecksummedAddress"

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

        if (!tokens) return res.status(200).send({ tokens: [] })

        await checkAndUpdateTokenStatus(tokens)

        const tokensAsJSON = tokens.map((token) => token.toJSON())

        return res.status(200).send({ data: tokensAsJSON })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
