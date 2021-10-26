import { InterRepBot } from "@interrep/telegram-bot"

async function main() {
    const { TELEGRAM_BOT_TOKEN, MONGO_URL, NEXTAUTH_URL } = process.env

    if (TELEGRAM_BOT_TOKEN && MONGO_URL && NEXTAUTH_URL) {
        const bot = new InterRepBot(TELEGRAM_BOT_TOKEN, MONGO_URL, NEXTAUTH_URL)

        return bot.start()
    }

    return null
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
