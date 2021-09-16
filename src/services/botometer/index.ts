import { Botometer } from "botometer"
import config from "src/config"
import logger from "src/utils/server/logger"

const botometer = new Botometer({
    consumerKey: config.TWITTER_CONSUMER_KEY,
    consumerSecret: config.TWITTER_CONSUMER_SECRET,
    accessToken: config.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: config.TWITTER_ACCESS_TOKEN_SECRET,
    rapidApiKey: config.RAPIDAPI_KEY,
    usePro: true
})

export default async function getBotScore(handle: string): Promise<any | null> {
    try {
        return botometer.getScore(handle)
    } catch (err) {
        logger.error(err)

        return null
    }
}
