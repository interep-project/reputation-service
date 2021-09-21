import { getWeb2Providers, getReputationLevels, Web2Provider } from "@interrep/reputation-criteria"

export default function getGroupIds(web2Provider?: Web2Provider): string[] {
    if (web2Provider) {
        const reputationLevels = getReputationLevels(web2Provider)

        return reputationLevels.map((reputation) => `${web2Provider.toUpperCase()}_${reputation}`)
    }

    const web2Providers = getWeb2Providers()
    let groups: string[] = []

    for (const web2Provider of web2Providers) {
        groups = groups.concat(getGroupIds(web2Provider))
    }

    return groups
}
