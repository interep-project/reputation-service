import { calculateReputation, ReputationLevel, OAuthProvider, getReputationLevels } from "@interrep/reputation-criteria"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { OAuthAccount } from "@interrep/db"
import getBotometerScore from "src/services/botometer"
import { getGithubUserByToken } from "src/services/github"
import { getRedditUserByToken } from "src/services/reddit"
import { getTwitterUserByToken } from "src/services/twitter"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"
import addIdentityCommitments from "src/core/groups/addIdentityCommitments"

export default async function addOAuthIdentityCommitmentController(
    req: NextApiRequest,
    res: NextApiResponse,
    provider: OAuthProvider
) {
    const name = req.query?.name
    const identityCommitment = req.query?.identityCommitment

    if (!name || typeof name !== "string" || !identityCommitment || typeof identityCommitment !== "string") {
        return res.status(400).end()
    }

    const token = req.headers.authorization

    if (token) {
        let reputation: ReputationLevel
        let accountId: string

        try {
            switch (provider) {
                case OAuthProvider.GITHUB: {
                    const { id, plan, followers, receivedStars } = await getGithubUserByToken(token)

                    accountId = id
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

                    accountId = id
                    reputation = calculateReputation(OAuthProvider.REDDIT, {
                        premiumSubscription: has_subscribed_to_premium,
                        karma: total_karma,
                        coins,
                        linkedIdentities: linked_identities.length
                    })

                    break
                }
                case OAuthProvider.TWITTER: {
                    const { id_str, screen_name, followers_count, verified } = await getTwitterUserByToken(token)
                    const botometerResult = await getBotometerScore(screen_name)

                    accountId = id_str
                    reputation = calculateReputation(OAuthProvider.REDDIT, {
                        followers: followers_count,
                        verifiedProfile: verified,
                        botometerOverallScore: botometerResult?.display_scores?.universal?.overall
                    })

                    break
                }
                default:
                    throw new Error(`Provider ${provider} is not supported`)
            }

            await dbConnect()

            let account = await OAuthAccount.findByProviderAccountId(provider, accountId)

            if (!account) {
                account = await OAuthAccount.create({
                    provider,
                    providerAccountId: accountId,
                    isLinkedToAddress: false,
                    reputation,
                    uniqueKey: `${provider}:${accountId}`,
                    createdAt: Date.now()
                })
            }

            if (account.hasJoinedAGroup) {
                throw new Error(`Account already joined a ${provider} group`)
            }

            const reputationLevels = getReputationLevels()

            switch (name) {
                case ReputationLevel.GOLD:
                    await addIdentityCommitments(provider, reputationLevels, identityCommitment)
                    break
                case ReputationLevel.SILVER:
                    reputationLevels.shift()
                    await addIdentityCommitments(provider, reputationLevels, identityCommitment)
                    break
                case ReputationLevel.BRONZE:
                    reputationLevels.shift()
                    reputationLevels.shift()
                    await addIdentityCommitments(provider, reputationLevels, identityCommitment)
                    break
                default:
                    await addIdentityCommitments(provider, [ReputationLevel.NOT_SUFFICIENT], identityCommitment)
                    break
            }

            account.hasJoinedAGroup = true

            await account.save()

            return res.status(201).send({ data: true })
        } catch (error) {
            logger.error(error)

            return res.status(500).end()
        }
    }

    const { accountId } = JSON.parse(req.body)

    if (!accountId) {
        return res.status(400).end()
    }

    const session = await getSession({ req })

    if (!session) {
        return res.status(401).end()
    }

    if (session.accountId !== accountId) {
        return res.status(403).end()
    }

    try {
        await dbConnect()

        logger.silly(`Adding identity commitment ${identityCommitment} to the tree of the ${provider} group ${name}`)

        const account = await OAuthAccount.findById(accountId)

        if (!account) {
            throw new Error(`Account not found`)
        }

        if (account.provider !== provider) {
            throw new Error("Account doesn't have the right provider")
        }

        if (!account.reputation || account.reputation !== name) {
            throw new Error("Account doesn't have the right reputation")
        }

        if (account.hasJoinedAGroup) {
            throw new Error(`Account already joined a ${provider} group`)
        }

        const reputationLevels = getReputationLevels()

        switch (name) {
            case ReputationLevel.GOLD:
                await addIdentityCommitments(provider, reputationLevels, identityCommitment)
                break
            case ReputationLevel.SILVER:
                reputationLevels.shift()
                await addIdentityCommitments(provider, reputationLevels, identityCommitment)
                break
            case ReputationLevel.BRONZE:
                reputationLevels.shift()
                reputationLevels.shift()
                await addIdentityCommitments(provider, reputationLevels, identityCommitment)
                break
            default:
                await addIdentityCommitments(provider, [ReputationLevel.NOT_SUFFICIENT], identityCommitment)
                break
        }

        account.hasJoinedAGroup = true

        await account.save()

        return res.status(201).send({ data: true })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
