import { NextApiRequest, NextApiResponse } from "next"
import jwt from "next-auth/jwt"
import { checkTwitterReputationById, checkTwitterReputationByUsername } from "src/core/reputation/twitter"
import config from "src/config"
import { JWToken } from "src/types/nextAuth/token"
import logger from "src/utils/server/logger"

class TwitterAccountController {
    public getTwitterReputation = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
        const { query } = req
        let twitterReputation

        // username was passed
        if (query?.username && typeof query.username === "string") {
            twitterReputation = await checkTwitterReputationByUsername(query.username)
            // id was passed
        } else if (query?.id && typeof query.id === "string") {
            twitterReputation = await checkTwitterReputationById(query.id)
        } else {
            return res.status(400).send("No id or username was provided")
        }

        if (twitterReputation) {
            return res.status(200).send({ data: twitterReputation })
        } else {
            logger.error(`No twitter reputation returned. Query username: ${query?.username}, id: ${query?.id}`)
            return res.status(500).end()
        }
    }

    public getMyTwitterReputation = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
        // @ts-ignore: accepts secret
        const token: JWToken = await jwt.getToken({
            req,
            secret: config.JWT_SECRET
        })

        if (!token) {
            // Not Signed in
            res.status(401).end()
            return
        }

        if (!token?.twitter?.userId) {
            res.status(401).end()
            return
        }

        const twitterReputation = await checkTwitterReputationById(token.twitter.userId)

        if (twitterReputation) {
            res.status(200).send({ data: twitterReputation })
        } else {
            res.status(500).end()
            return
        }

        res.end()
    }
}

export default new TwitterAccountController()
