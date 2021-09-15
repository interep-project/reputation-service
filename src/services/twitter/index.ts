import Twitter from "twitter-v2"
import config from "src/config"
import { TwitterUser } from "src/types/twitter"
import logger from "src/utils/server/logger"

const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } = config

if (!TWITTER_CONSUMER_KEY || !TWITTER_CONSUMER_SECRET) {
    throw Error("Twitter keys not provided")
}

const client = new Twitter({
    consumer_key: config.TWITTER_CONSUMER_KEY || "",
    consumer_secret: config.TWITTER_CONSUMER_SECRET || ""
})

const userRequestedFields = {
    "user.fields": ["id", "profile_image_url", "public_metrics", "verified", "created_at"]
}

export const getTwitterUserByUsername = async ({ username }: { username: string }): Promise<TwitterUser> => {
    // https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username
    const { data } = await client.get(`users/by/username/${username}`, userRequestedFields)

    return data
}

export const getTwitterUserById = async ({ id }: { id: string }): Promise<TwitterUser> => {
    // See https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-id
    const { data } = await client.get(`users/${id}`, userRequestedFields)

    return data
}

export const getTwitterFriendsByUserId = async ({
    userId,
    maxResults = 10
}: {
    userId: string
    maxResults?: number
}): Promise<TwitterUser[]> => {
    const finalData: TwitterUser[] = []
    let nextToken
    let hasError = false

    const baseParams = { ...userRequestedFields, max_results: maxResults }

    do {
        const params = nextToken ? { ...baseParams, pagination_token: nextToken } : baseParams
        // https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-following
        try {
            const response: {
                data: TwitterUser[]
                meta: { next_token: string; result_count: string }
                // @ts-ignore: twitter expects an integer, not a string
            } = await client.get(`users/${userId}/following`, params)

            const { data, meta } = response
            finalData.push(...data)
            nextToken = meta.next_token
        } catch (error) {
            logger.error(error)
            hasError = true
        }
    } while (nextToken && !hasError)

    return finalData
}
