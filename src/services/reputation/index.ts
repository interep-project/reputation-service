import {
    OAuthProvider,
    ProviderParameters,
    ReputationLevel,
    calculateReputation as calculateProviderReputation
} from "@interep/reputation"
import { getGithubUserByToken } from "../github"
import { getRedditUserByToken } from "../reddit"
import { getTwitterUserByToken } from "../twitter"

const FUNCS: {
    [K in OAuthProvider]: (token: string) => Promise<{ id: string; reputationParams: ProviderParameters }>
} = {
    [OAuthProvider.GITHUB]: getGithubUserByToken,
    [OAuthProvider.REDDIT]: getRedditUserByToken,
    [OAuthProvider.TWITTER]: getTwitterUserByToken
}

export async function calculateReputation({
    provider,
    token
}: {
    provider: OAuthProvider
    token: string
}): Promise<{ id: string; reputation: ReputationLevel }> {
    const { id, reputationParams } = await FUNCS[provider](token)
    const reputation = calculateProviderReputation(provider, reputationParams) as ReputationLevel
    return { id, reputation }
}
