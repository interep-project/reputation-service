import { getPoapTokens } from "src/services/poap"
import getPoapEventFancyId from "./getPoapEventFancyId"
import PoapGroupName from "./poapGroupName"

export default async function getPoapGroupNamesByAddress(ethereumAddress: string): Promise<PoapGroupName[]> {
    const tokens = await getPoapTokens(ethereumAddress)
    const groupNames = Object.values(PoapGroupName)

    return groupNames.filter((groupName) =>
        tokens.some((token: any) => token.event.fancy_id === getPoapEventFancyId(groupName))
    )
}
