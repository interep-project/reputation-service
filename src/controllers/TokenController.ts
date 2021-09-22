import { NextApiRequest, NextApiResponse } from "next"
import checkAndUpdateTokenStatus from "src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus"
import mintToken from "src/core/linking/mintToken"
import Token from "src/models/tokens/Token.model"
import getChecksummedAddress from "src/utils/crypto/getChecksummedAddress"
import logger from "src/utils/server/logger"

class TokenController {
    public getTokensByAddress = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
        try {
            const { owner } = req.query

            if (!owner || typeof owner !== "string") {
                return res.status(400).end()
            }

            const ownerChecksummedAddress = getChecksummedAddress(owner)

            if (!ownerChecksummedAddress) return res.status(400).send("Invalid address")

            const tokens = await Token.findByUserAddress(ownerChecksummedAddress)

            if (!tokens) return res.status(200).send({ tokens: [] })

            await checkAndUpdateTokenStatus(tokens)

            const tokensAsJSON = tokens.map((token) => token.toJSON())

            return res.status(200).send({ data: tokensAsJSON })
        } catch (err) {
            logger.error(err)
            return res.status(500).end()
        }
    }

    public mintToken = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
        const { tokenId } = JSON.parse(req.body)

        if (!tokenId) return res.status(400).end()

        try {
            const txResponse = await mintToken(tokenId)

            return res.status(200).send({ data: txResponse })
        } catch (error) {
            logger.error(error)
            return res.status(400).send(error)
        }
    }
}

export default new TokenController()
