import { getPlatforms, getReputationLevels, Platform } from "@interrep/reputation-criteria"

export default function getGroupIds(platform?: Platform): string[] {
    let groups: string[] = []

    if (platform) {
        const reputationLevels = getReputationLevels(platform)

        for (const reputation of reputationLevels) {
            groups.push(`${platform.toUpperCase()}_${reputation}`)
        }
    } else {
        const platforms = getPlatforms()

        for (const platform of platforms) {
            groups = groups.concat(getGroupIds(platform))
        }
    }

    return groups
}
