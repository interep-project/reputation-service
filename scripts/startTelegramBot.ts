import { InterRepBot } from "@interrep/telegram-bot"

async function main() {
    const { TELEGRAM_BOT_TOKEN, MONGO_URL, NEXTAUTH_URL } = process.env

    const bot = new InterRepBot(TELEGRAM_BOT_TOKEN as string, MONGO_URL as string, NEXTAUTH_URL as string)

    return bot.start()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
