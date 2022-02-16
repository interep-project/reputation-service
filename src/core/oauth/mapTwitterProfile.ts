/* istanbul ignore file */
import { TwitterParameters } from "@interep/reputation"
import { getBotometerScore } from "src/services/botometer"
import { User } from "src/types/next-auth"

export default async function mapTwitterProfile({
    id_str,
    name,
    screen_name,
    followers_count,
    verified
}: User): Promise<User & TwitterParameters> {
    const botometerResult = await getBotometerScore(screen_name)

    return {
        id: id_str,
        name,
        username: screen_name,
        followers: followers_count,
        verifiedProfile: verified,
        botometerOverallScore: botometerResult?.display_scores?.universal?.overall
    }
}
