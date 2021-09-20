import { TwitterParameters } from "@interrep/reputation-criteria"
import getBotometerScore from "src/services/botometer"
import { getTwitterUserByUsername } from "src/services/twitter"

export default async function getParametersByUsername(username: string): Promise<TwitterParameters> {
    const twitterUser = await getTwitterUserByUsername({
        username
    })

    if (!twitterUser) {
        throw new Error(`Twitter user with username:${username} not found`)
    }

    const botometerResult = await getBotometerScore(username)

    if (!botometerResult?.display_scores) {
        throw new Error(`Botometer results don't contain display scores`)
    }

    return {
        followers: twitterUser.public_metrics.followers_count,
        verifiedProfile: twitterUser.verified,
        botometerOverallScore: botometerResult.display_scores.universal.overall
    }
}
