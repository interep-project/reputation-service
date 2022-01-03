import { OAuthAccount } from "@interrep/db"
import { OAuthProvider, ReputationLevel } from "@interrep/reputation"
import { getTwitterUserByUsername } from "src/services/twitter"
import logger from "src/utils/backend/logger"

export default async function seedTwitterUsers(twitterUsernames: string[]): Promise<void> {
    logger.verbose("Seeding Twitter accounts...")

    for (const username of twitterUsernames) {
        const twitterUser = await getTwitterUserByUsername({
            username
        })
        const account = await OAuthAccount.findByProviderAccountId(OAuthProvider.TWITTER, twitterUser.id)

        if (!account) {
            await OAuthAccount.create({
                provider: OAuthProvider.TWITTER,
                providerAccountId: twitterUser.id,
                reputation: ReputationLevel.GOLD
            })

            logger.verbose(`Twitter user '${username}' has been inserted`)
        }
    }

    logger.info(`All the Twitter users have been inserted correctly`)
}
