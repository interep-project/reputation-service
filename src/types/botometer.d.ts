export type botometerScores = {
    astroturf: number
    fake_follower: number
    financial: number
    other: number
    overall: number
    self_declared: number
    spammer: number
}

export type botometerScoreData = {
    cap?: { english?: number; universal: number }
    raw_scores?: {
        english?: botometerScores
        universal: botometerScores
    }
    display_scores?: {
        english?: botometerScores
        universal: botometerScores
    }
}

export type botometerData = botometerScoreData & {
    twitterData?: {
        user?: {
            id: number
            followers_count: number
            friends_count: number
            created_at: string
        }
    }
    [key: string]: unknown
}
