import config from "src/config"
import { TwitterUser } from "src/types/twitter"
import Twitter from "twitter-v2"

const client = new Twitter({
    consumer_key: config.TWITTER_CONSUMER_KEY || "",
    consumer_secret: config.TWITTER_CONSUMER_SECRET || ""
})

export const getTwitterUserByToken = async (token: string) => {
    const headers = new Headers({
        Authorization: token
    })

    const userResponse = await fetch("https://api.twitter.com/1.1/account/verify_credentials.json", {
        headers
    })

    return userResponse.json()
}

export const getTwitterUserByUsername = async ({ username }: { username: string }): Promise<TwitterUser> => {
    // https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username
    const { data } = await client.get(`users/by/username/${username}`, {
        "user.fields": ["id", "profile_image_url", "public_metrics", "verified", "created_at"]
    })

    return data
}
