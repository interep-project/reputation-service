import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { unlinkAccounts } from "src/core/badges"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function unlinkAccountsController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "PUT") {
        return res.status(405).end()
    }

    const session = await getSession({ req })

    if (!session) {
        return res.status(401).end()
    }

    const { decryptedAttestation, accountId } = JSON.parse(req.body)

    if (!decryptedAttestation || !accountId) {
        return res.status(400).end()
    }

    if (session.accountId !== accountId) {
        return res.status(403).end()
    }

    try {
        await dbConnect()

        await unlinkAccounts(decryptedAttestation, accountId)

        return res.status(200).send({ data: true })
    } catch (err) {
        logger.error(err)

        return res.status(500).end()
    }
}
