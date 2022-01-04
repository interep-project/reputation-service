import { InterRepBot } from "@interrep/telegram-bot"
import { logger } from "src/utils/backend"

export async function run() {
    const { TELEGRAM_BOT_TOKEN, MONGO_URL, NEXTAUTH_URL } = process.env

    if (!TELEGRAM_BOT_TOKEN || !MONGO_URL || !NEXTAUTH_URL) {
        logger.warn("Telegram bot env variables are not defined. The bot will not be started.")
        return
    }

    try {
        const bot = new InterRepBot(TELEGRAM_BOT_TOKEN, MONGO_URL, NEXTAUTH_URL)

        await bot.start()
    } catch (error) {
        logger.error(error)
    }
}
