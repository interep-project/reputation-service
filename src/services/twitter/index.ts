import { TwitterParameters } from "@interep/reputation"
import { getBotometerScore } from "../botometer"

const url = "https://api.twitter.com/1.1"

export const getTwitterUserByToken = async (token: string) => {
    const headers = new Headers({
        Authorization: token
    })

    const userResponse = await fetch(`${url}/account/verify_credentials.json`, {
        headers
    })

    const { followers_count: followers, screen_name: login, verified: verifiedProfile } = await userResponse.json()
    return { followers, verifiedProfile, login }
}

export async function getTwitterReputationParams(token: string): Promise<TwitterParameters> {
    const { followers, verifiedProfile, login } = await getTwitterUserByToken(token)
    const {
        cap: { universal: botometerOverallScore }
    } = await getBotometerScore(login)

    return { followers, verifiedProfile, botometerOverallScore }
}
