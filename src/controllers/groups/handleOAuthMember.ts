import { OAuthAccount } from "@interep/db"
import { OAuthProvider } from "@interep/reputation"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { appendLeaf } from "src/core/groups/mts"
import { calculateReputation } from "src/services"
import { GroupName } from "src/types/groups"
import { connectDatabase, logger } from "src/utils"

export default async function handleOAuthMemberController(req: NextApiRequest, res: NextApiResponse) {
    const provider = req.query?.provider as OAuthProvider
    const name = req.query?.name as GroupName
    const identityCommitment = req.query?.member as string

    const token = req.headers.authorization

    if (token) {
        try {
            const { id: providerAccountId, reputation } = await calculateReputation({ provider, token })
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

        // @ts-expect-error says no overlap between ReputationLevel and GroupName ??
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
