import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function hasJoinedAGroupController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).end()
    }

    const session = await getSession({ req })

    if (!session) {
        return res.status(401).end()
    }

    try {
        await dbConnect()

        const web2Account = await Web2Account.findById(session.web2AccountId)

        if (!web2Account) {
            return res.status(500).send("Can't find web 2 account")
        }

        return res.status(200).send({ data: !!web2Account.hasJoinedAGroup })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
