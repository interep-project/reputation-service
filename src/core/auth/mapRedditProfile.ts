import { RedditParameters } from "@interrep/reputation"
import { User } from "src/types/next-auth"

export default async function mapRedditProfile({
    id,
    name,
    has_subscribed_to_premium,
    total_karma,
    coins,
    linked_identities
}: User): Promise<User & RedditParameters> {
    return {
        id,
        name,
        username: name,
        premiumSubscription: has_subscribed_to_premium,
        karma: total_karma,
        coins,
        linkedIdentities: linked_identities.length
    }
}
