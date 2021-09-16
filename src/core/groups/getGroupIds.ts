import { getPlatforms, getReputationLevels, Platform } from "@interrep/reputation-criteria"

export default function getGroupIds(platform?: Platform): string[] {
    if (platform) {
        const reputationLevels = getReputationLevels(platform)

        return reputationLevels.map((reputation) => `${platform.toUpperCase()}_${reputation}`)
    }

    const platforms = getPlatforms()
    let groups: string[] = []

    for (const platform of platforms) {
        groups = groups.concat(getGroupIds(platform))
    }

    return groups
}
