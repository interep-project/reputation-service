import { OAuthAccount } from "@interrep/db"
import { ReputationLevel } from "@interrep/reputation"
import { utils } from "ethers"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { checkUserSignature, linkAccounts } from "src/core/badges"
import { logger } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"
import { capitalize } from "src/utils/common"

export default async function linkAccountsController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "PUT") {
        res.status(405).end()
        return
    }

    const session = await getSession({ req })

    if (!session) {
        res.status(401).end()
        return
    }

    const { userAddress, accountId, userSignature, userPublicKey } = JSON.parse(req.body)

    if (!userAddress || !accountId || !userSignature || !userPublicKey) {
        res.status(400).end()
        return
    }

    if (!utils.isAddress(userAddress)) {
        res.status(400).send("The user address is not valid")
        return
    }

    if (session.accountId !== accountId) {
        res.status(403).send("The account id does not match the session account id")
        return
    }

    if (!checkUserSignature(userAddress, accountId, userSignature)) {
        res.status(400).send("The user signature is not valid")
        return
    }

    try {
        await connectDatabase()

        const account = await OAuthAccount.findById(accountId)

        if (!account) {
            throw new Error(`The account does not exist`)
        }

        if (account.isLinkedToAddress) {
            throw new Error(`The account has already been linked`)
        }

        if (!account.reputation || account.reputation !== ReputationLevel.GOLD) {
            throw new Error(`The account reputation is not sufficient`)
        }

        const token = await linkAccounts(account, userAddress, userPublicKey)

        res.status(201).send({ data: token.toJSON() })

        logger.info(
            `[${req.url}] The ${capitalize(account.provider)} account ${account.providerAccountId} has been linked`
        )
    } catch (err) {
        res.status(500).end()

        logger.error(err)
    }
}
