import seedTwitterUsers from "src/utils/seeding/seedTwitterUsers"
import { dbConnect, dbDisconnect } from "src/utils/server/database"

const twitterUsernames = [
    // "twobitidiot",
    // "La__Cuen", 10k+ friends
    // "VitalikButerin",
    // "FEhrsam",
    "byrongibson",
    "arcalinea"
    // "kumavis_",
    // "whyrusleeping",
    // "juanbenet",
    // "karl_dot_tech",
    // "jinglanW",
    // "jillruthcarlson",
    // "zmanian", 10k+ friends
    // "notscottmoore",
    // "RaphaelRoullet",
    // "nicksdjohnson",
    // "emilianobonassi",
    // "kaiynne",
    // "RuneKek",
    // "haydenzadams",
    // "sassal0x",
    // "drakefjustin",
]

;(async () => {
    dbConnect()

    try {
        await seedTwitterUsers(twitterUsernames, true)
        dbDisconnect()

        process.exit(0)
    } catch (error) {
        console.error(error)

        process.exit(1)
    }
})()
