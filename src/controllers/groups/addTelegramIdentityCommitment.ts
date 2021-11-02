import { sha256 } from "@interrep/telegram-bot"
import { TelegramUser } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { addIdentityCommitment } from "src/core/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function addTelegramIdentityCommitmentController(req: NextApiRequest, res: NextApiResponse) {
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

    const hashId = sha256(telegramUserId + name)
    const telegramUser = await TelegramUser.findByHashId(hashId)

    if (!telegramUser) {
        return res.status(403).end()
    }

    try {
        if (telegramUser.joined) {
            throw new Error(`Telegram user already joined this group`)
        }

        await dbConnect()

        logger.silly(`Adding identity commitment ${identityCommitment} to the tree of the Telegram group ${name}`)

        await addIdentityCommitment("telegram", name, identityCommitment)

        telegramUser.joined = true

        await telegramUser.save()

        return res.status(201).send({ data: true })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
