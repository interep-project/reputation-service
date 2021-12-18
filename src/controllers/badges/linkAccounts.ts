import { OAuthAccount, Token } from "@interrep/db"
import { ReputationLevel } from "@interrep/reputation"
import { utils } from "ethers"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { checkUserSignature, linkAccounts } from "src/core/badges"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function linkAccountsController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "PUT") {
        return res.status(405).end()
    }

    const session = await getSession({ req })

    if (!session) {
        return res.status(401).end()
    }

    const { userAddress, accountId, userSignature, userPublicKey } = JSON.parse(req.body)

    if (!userAddress || !accountId || !userSignature || !userPublicKey) {
        return res.status(400).end()
    }

    if (!utils.isAddress(userAddress)) {
        return res.status(400).send("The user address is not valid")
    }

    if (session.accountId !== accountId) {
        return res.status(403).send("The account id does not match the session account id")
    }

    if (!checkUserSignature(userAddress, accountId, userSignature)) {
        return res.status(400).send("The user signature is not valid")
    }

    try {
        await dbConnect()

        const account = await OAuthAccount.findById(accountId)

        if (!account) {
            throw new Error(`The account id does not match any account in the db`)
        }

        if (account.isLinkedToAddress) {
            throw new Error(`The account has already been linked`)
        }

        if (!account.reputation || account.reputation !== ReputationLevel.GOLD) {
            throw new Error(`The account reputation is not sufficient`)
        }

        const token = await linkAccounts(account, userAddress, userPublicKey)

        return token instanceof Token ? res.status(201).send({ data: token.toJSON() }) : res.status(500).end()
    } catch (err) {
        logger.error(err)
        return res.status(500).end()
    }
}
