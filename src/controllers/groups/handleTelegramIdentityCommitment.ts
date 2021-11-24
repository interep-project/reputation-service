import { sha256 } from "@interrep/telegram-bot"
import { TelegramUser } from "@interrep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { addIdentityCommitment, deleteIdentityCommitment } from "src/core/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function handleTelegramIdentityCommitmentController(req: NextApiRequest, res: NextApiResponse) {
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
            return res.status(403).end()
        }

        if (req.method === "POST") {
            if (telegramUser.hasJoined) {
                throw new Error(`Telegram user already joined this group`)
            }

            await addIdentityCommitment("telegram", name, identityCommitment)

            telegramUser.hasJoined = true
        } else if (req.method === "DELETE") {
            if (!telegramUser.hasJoined) {
                throw new Error(`Telegram user has not joined this group yet`)
            }

            await deleteIdentityCommitment("telegram", name, identityCommitment)

            telegramUser.hasJoined = false
        }

        await telegramUser.save()

        return res.status(201).send({ data: true })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
