import { seedTwitterUsers } from "src/utils/backend/seeding"
import { dbConnect, dbDisconnect } from "src/utils/backend/database"

const twitterUsernames = [
    // "twobitidiot",
    // "La__Cuen", 10k+ friends
    // "VitalikButerin",
    // "FEhrsam",
    "byrongibson",
    "arcalinea",
    "cedoor_"
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

async function main() {
    await dbConnect()

    await seedTwitterUsers(twitterUsernames)

    await dbDisconnect()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
