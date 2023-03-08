import { RedditParameters } from "@interep/reputation"

const url = "https://oauth.reddit.com/api/v1"

export async function getRedditReputationParams(token: string): Promise<RedditParameters> {
    const headers = new Headers({
        Authorization: token
    })

    const userResponse = await fetch(`${url}/me`, {
        headers
    })

    const { has_gold_subscription, has_subscribed_to_premium, total_karma } = await userResponse.json()

    // gold membership was renamed to premium in 2018, don't know what is the difference between has_gold_subscription and has_subscribed_to_premium so adding them
    return { isGold: has_gold_subscription || has_subscribed_to_premium, totalKarma: total_karma }
}
