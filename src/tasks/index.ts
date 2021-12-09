import { run as runCron } from "./cron"
import { run as runTelegramBot } from "./telegramBot"

const [task] = process.argv.slice(2)

// If there is an argument with a specific task to run, it will run only that
// task, otherwise it will run all the tasks.
switch (task) {
    case "cron":
        runCron()
        break
    case "telegram-bot":
        runTelegramBot()
        break
    default:
        runCron()
        runTelegramBot()
}
