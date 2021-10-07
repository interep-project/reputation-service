import { calculateReputation, ReputationLevel, Web2Provider } from "@interrep/reputation-criteria"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { addIdentityCommitment, getGroupId } from "src/core/groups"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import getBotometerScore from "src/services/botometer"
import { getGithubUserByToken } from "src/services/github"
import { getRedditUserByToken } from "src/services/reddit"
import { getTwitterUserByToken } from "src/services/twitter"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function addWeb2IdentityCommitmentController(
    req: NextApiRequest,
    res: NextApiResponse,
    provider: Web2Provider
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
                case Web2Provider.GITHUB: {
                    const { id, plan, followers, receivedStars } = await getGithubUserByToken(token)

                    accountId = id
                    reputation = calculateReputation(Web2Provider.GITHUB, {
                        proPlan: plan.name === "pro",
                        followers,
                        receivedStars
                    })

                    break
                }
                case Web2Provider.REDDIT: {
                    const {
                        id,
                        has_subscribed_to_premium,
                        total_karma,
                        coins,
                        linked_identities
                    } = await getRedditUserByToken(token)

                    accountId = id
                    reputation = calculateReputation(Web2Provider.REDDIT, {
                        premiumSubscription: has_subscribed_to_premium,
                        karma: total_karma,
                        coins,
                        linkedIdentities: linked_identities.length
                    })

                    break
                }
                case Web2Provider.TWITTER: {
                    const { id_str, screen_name, followers_count, verified } = await getTwitterUserByToken(token)
                    const botometerResult = await getBotometerScore(screen_name)

                    accountId = id_str
                    reputation = calculateReputation(Web2Provider.REDDIT, {
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

            let web2Account = await Web2Account.findByProviderAccountId(provider, accountId)

            if (!web2Account) {
                web2Account = await Web2Account.create({
                    provider,
                    providerAccountId: accountId,
                    isLinkedToAddress: false,
                    basicReputation: reputation,
                    uniqueKey: `${provider}:${accountId}`,
                    createdAt: Date.now()
                })
            }

            if (web2Account.hasJoinedAGroup) {
                throw new Error(`Web 2 account already joined a ${provider} group`)
            }

            const rootHash = await addIdentityCommitment(provider, reputation, identityCommitment)

            web2Account.hasJoinedAGroup = true

            await web2Account.save()

            return res.status(201).send({ data: rootHash })
        } catch (error) {
            logger.error(error)

            return res.status(500).end()
        }
    }

    const { web2AccountId } = JSON.parse(req.body)

    if (!web2AccountId) {
        return res.status(400).end()
    }

    const session = await getSession({ req })

    if (!session) {
        return res.status(401).end()
    }

    if (session.web2AccountId !== web2AccountId) {
        return res.status(403).end()
    }

    try {
        await dbConnect()

        const groupId = getGroupId(provider, name as any)

        logger.silly(`Adding identity commitment ${identityCommitment} to the tree of the group ${groupId}`)

        const web2Account = await Web2Account.findById(web2AccountId)

        if (!web2Account) {
            throw new Error(`Web 2 account not found`)
        }

        if (web2Account.provider !== provider) {
            throw new Error("Web 2 account doesn't have the right provider")
        }

        if (!web2Account.basicReputation || web2Account.basicReputation !== name) {
            throw new Error("Web 2 account doesn't have the right reputation")
        }

        if (web2Account.hasJoinedAGroup) {
            throw new Error(`Web 2 account already joined a ${provider} group`)
        }

        const rootHash = await addIdentityCommitment(provider, name, identityCommitment)

        web2Account.hasJoinedAGroup = true

        await web2Account.save()

        return res.status(201).send({ data: rootHash.toString() })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
