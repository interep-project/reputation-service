import { getPoapTokens } from "src/services/poap"
import PoapGroupId from "./poapGroupIds"

function getEventFancyId(groupId: PoapGroupId) {
    return groupId.substr(5).toLowerCase().replace("_", "")
}

export default async function getPoapGroupIds(ethereumAddress: string): Promise<PoapGroupId[]> {
    const tokens = await getPoapTokens(ethereumAddress)
    const groupIds = Object.values(PoapGroupId)

    return groupIds.filter((groupId) => tokens.some((token: any) => token.event.fancy_id === getEventFancyId(groupId)))
}
