import { getPoapTokens } from "src/services/poap"
import getPoapEvents from "./getPoapEvents"
import PoapEvent from "./poapEvent"

export default async function getPoapEventsByAddress(ethereumAddress: string): Promise<PoapEvent[]> {
    const tokens = await getPoapTokens(ethereumAddress)

    return getPoapEvents().filter((event) => tokens.some((token: any) => token.event.fancy_id === event))
}
