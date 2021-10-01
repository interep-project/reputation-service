import { getPoapTokens } from "src/services/poap"
import getPoapEventFancyId from "./getPoapEventFancyId"
import PoapGroupId from "./poapGroupIds"

export default async function getPoapGroupIdsByAddress(ethereumAddress: string): Promise<PoapGroupId[]> {
    const tokens = await getPoapTokens(ethereumAddress)
    const groupIds = Object.values(PoapGroupId)

    return groupIds.filter((groupId) =>
        tokens.some((token: any) => token.event.fancy_id === getPoapEventFancyId(groupId))
    )
}
