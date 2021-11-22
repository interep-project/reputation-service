import { TelegramUser } from "@interrep/db"
import { sha256 } from "@interrep/telegram-bot"
import { NextApiRequest, NextApiResponse } from "next"
import { deleteIdentityCommitment } from "src/core/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function deleteTelegramIdentityCommitmentController(req: NextApiRequest, res: NextApiResponse) {
    const name = req.query?.name
    const identityCommitment = req.query?.identityCommitment
    const { telegramUserId } = JSON.parse(req.body)

    if (
        !name ||
        typeof name !== "string" ||
        !identityCommitment ||
        typeof identityCommitment !== "string" ||
        !telegramUserId
    ) {
        return res.status(400).end()
    }

    try {
        await dbConnect()

        const hashId = sha256(telegramUserId + name)
        const telegramUser = await TelegramUser.findByHashId(hashId)

        if (!telegramUser) {
            return res.status(404).end()
        }

        if (!telegramUser.joined) {
            throw new Error(`Telegram user has not joined yet`)
        }

        logger.silly(`Deleting identity commitment ${identityCommitment} from the tree of the Telegram group ${name}`)

        await deleteIdentityCommitment("telegram", name, identityCommitment)

        telegramUser.joined = false

        await telegramUser.save()

        return res.status(201).send({ data: true })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
