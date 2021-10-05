import { NextApiRequest, NextApiResponse } from "next"
import checkAndUpdateTokenStatus from "src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus"
import mintToken from "src/core/linking/mintToken"
import Token from "src/models/tokens/Token.model"
import getChecksummedAddress from "src/utils/crypto/getChecksummedAddress"
import logger from "src/utils/backend/logger"

class TokenController {
    public getTokensByAddress = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
        const userAddress = req.query?.userAddress

        if (!userAddress || typeof userAddress !== "string") {
            return res.status(400).end()
        }

        const ownerChecksummedAddress = getChecksummedAddress(userAddress)

        if (!ownerChecksummedAddress) {
            return res.status(400).send("Invalid address")
        }

        try {
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

    public getToken = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
        const tokenId = req.query?.tokenId

        if (!tokenId || typeof tokenId !== "string") {
            return res.status(400).end()
        }

        try {
            const token = await Token.findById(tokenId)

            if (!token) {
                return res.status(500).send(`Token with id ${tokenId} not found`)
            }

            return res.status(200).send({ data: token.toJSON() })
        } catch (error) {
            logger.error(error)

            return res.status(500).end()
        }
    }

    public mintToken = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
        const tokenId = req.query?.tokenId

        if (!tokenId || typeof tokenId !== "string") {
            return res.status(400).end()
        }

        try {
            const txResponse = await mintToken(tokenId)

            return res.status(200).send({ data: txResponse })
        } catch (error) {
            logger.error(error)

            return res.status(500).send(error)
        }
    }
}

export default new TokenController()
