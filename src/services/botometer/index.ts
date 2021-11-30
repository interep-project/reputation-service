import { Botometer } from "botometer"
import config from "src/config"

const botometer = new Botometer({
    consumerKey: config.TWITTER_CONSUMER_KEY,
    consumerSecret: config.TWITTER_CONSUMER_SECRET,
    accessToken: config.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: config.TWITTER_ACCESS_TOKEN_SECRET,
    rapidApiKey: config.RAPIDAPI_KEY,
    usePro: true
})

export async function getBotometerScore(username: string): Promise<any> {
    return botometer.getScore(username)
}
