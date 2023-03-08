import { TwitterParameters } from "@interep/reputation"
import { getBotometerScore } from "../botometer"

const url = "https://api.twitter.com/1.1"

async function getPartialTwitterUserByToken(
    token: string
): Promise<{ id: string; login: string; reputationParams: Omit<TwitterParameters, "botometerOverallScore"> }> {
    const headers = new Headers({
        Authorization: token
    })

    const userResponse = await fetch(`${url}/account/verify_credentials.json`, {
        headers
    })

    const {
        id_str: id,
        followers_count: followers,
        screen_name: login,
        verified: verifiedProfile
    } = await userResponse.json()
    return { id, login, reputationParams: { followers, verifiedProfile } }
}

export async function getTwitterUserByToken(
    token: string
): Promise<{ id: string; reputationParams: TwitterParameters }> {
    const { id, login, reputationParams } = await getPartialTwitterUserByToken(token)
    const {
        cap: { universal: botometerOverallScore }
    } = await getBotometerScore(login)

    return { id, reputationParams: { ...reputationParams, botometerOverallScore } }
}
