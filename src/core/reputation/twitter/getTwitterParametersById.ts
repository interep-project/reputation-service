import { TwitterParameters } from "@interrep/reputation-criteria"
import getBotometerScore from "src/services/botometer"
import { getTwitterUserById } from "src/services/twitter"

export default async function getParametersById(id: string): Promise<TwitterParameters> {
    const twitterUser = await getTwitterUserById({
        id
    })

    if (!twitterUser) {
        throw new Error(`Twitter user with id:${id} not found`)
    }

    const botometerResult = await getBotometerScore(twitterUser.username)

    if (!botometerResult?.display_scores) {
        throw new Error(`Botometer results don't contain display scores`)
    }

    return {
        followers: twitterUser.public_metrics.followers_count,
        verifiedProfile: twitterUser.verified,
        botometerOverallScore: botometerResult.display_scores.universal.overall
    }
}
