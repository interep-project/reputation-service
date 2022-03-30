import { OAuthAccount } from "@interep/db"
import { calculateReputation, OAuthProvider, ReputationLevel } from "@interep/reputation"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { appendLeaf } from "src/core/groups/mts"
import { getBotometerScore } from "src/services/botometer"
import { getGithubUserByToken } from "src/services/github"
import { getRedditUserByToken } from "src/services/reddit"
import { getTwitterUserByToken } from "src/services/twitter"
import { GroupName } from "src/types/groups"
import { logger } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function handleOAuthMemberController(req: NextApiRequest, res: NextApiResponse) {
    const provider = req.query?.provider as OAuthProvider
    const name = req.query?.name as GroupName
    const identityCommitment = req.query?.member as string

    const token = req.headers.authorization

    if (token) {
        let reputation: ReputationLevel
        let providerAccountId: string

        try {
            switch (provider) {
                case OAuthProvider.GITHUB: {
                    const { id, plan, followers, receivedStars } = await getGithubUserByToken(token)

                    providerAccountId = id
                    reputation = calculateReputation(OAuthProvider.GITHUB, {
                        proPlan: plan.name === "pro",
                        followers,
                        receivedStars
                    })

                    break
                }
                case OAuthProvider.REDDIT: {
                    const {
                        id,
                        has_subscribed_to_premium,
                        total_karma,
                        coins,
                        linked_identities
                    } = await getRedditUserByToken(token)

                    providerAccountId = id
                    reputation = calculateReputation(OAuthProvider.REDDIT, {
                        premiumSubscription: has_subscribed_to_premium,
                        karma: total_karma,
                        coins,
                        linkedIdentities: linked_identities.length
                    })

                    break
                }
                default: {
                    const { id_str, screen_name, followers_count, verified } = await getTwitterUserByToken(token)
                    const botometerResult = await getBotometerScore(screen_name)

                    providerAccountId = id_str
                    reputation = calculateReputation(OAuthProvider.TWITTER, {
                        followers: followers_count,
                        verifiedProfile: verified,
                        botometerOverallScore: botometerResult?.display_scores?.universal?.overall
                    })

                    break
                }
            }

            await connectDatabase()

            let account = await OAuthAccount.findByProviderAccountId(provider, providerAccountId)

            if (!account) {
                account = await OAuthAccount.create({
                    provider,
                    providerAccountId,
                    reputation
                })
            }

            if (account.hasJoinedAGroup) {
                throw new Error(`Account already joined a ${provider} group`)
            }

            await appendLeaf(provider, name, identityCommitment)

            account.hasJoinedAGroup = true

            await account.save()

            res.status(201).send({ data: true })
        } catch (error) {
            res.status(500).end()

            logger.error(error)
        }

        return
    }

    const { accountId } = JSON.parse(req.body)

    if (!accountId) {
        res.status(400).end()
        return
    }

    const session = await getSession({ req })

    if (!session) {
        res.status(401).end()
        return
    }

    if (session.accountId !== accountId) {
        res.status(403).end()
        return
    }

    try {
        await connectDatabase()

        const account = await OAuthAccount.findById(accountId)

        if (!account) {
            throw new Error(`The account does not exist`)
        }

        if (account.provider !== provider) {
            throw new Error("The account provider is wrong")
        }

        if (!account.reputation || account.reputation !== name) {
            throw new Error("The account reputation does not match")
        }

        if (account.hasJoinedAGroup) {
            throw new Error(`The account already joined a ${provider} group`)
        }

        await appendLeaf(provider, name, identityCommitment)

        account.hasJoinedAGroup = true

        await account.save()

        res.status(201).send({ data: true })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
