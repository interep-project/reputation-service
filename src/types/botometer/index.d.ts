declare module "botometer" {
    class Botometer {
        constructor(_options: any)

        checkAccount(twitterData: any): any

        errorLog(message: any, ...args: any[]): void

        getScore(name: any): any

        getScoreFor(name: any): any

        getScores(names: any): any

        getScoresGenerator(names: any, ...args: any[]): any

        getTwitterData(name: any): any

        log(message: any, ...args: any[]): void

        parseBotometerApiError(e: any): any

        parseTwitterApiError(e: any): any
    }

    interface BotometerScores {
        astroturf: number
        fake_follower: number
        financial: number
        other: number
        overall: number
        self_declared: number
        spammer: number
    }

    interface BotometerScoreData {
        cap?: { english?: number; universal: number }
        raw_scores?: {
            english?: BotometerScores
            universal: BotometerScores
        }
        display_scores?: {
            english?: BotometerScores
            universal: BotometerScores
        }
    }
}
