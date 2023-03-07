import {
    OAuthProvider,
    ProviderParameters,
    ReputationLevel,
    calculateReputation as calculateProviderReputation
} from "@interep/reputation"
import { getGhReputationParams } from "../github"
import { getRedditReputationParams } from "../reddit"
import { getTwitterReputationParams } from "../twitter"

const FUNCS: {
    [K in OAuthProvider]: (token: string) => Promise<ProviderParameters>
} = {
    [OAuthProvider.GITHUB]: getGhReputationParams,
    [OAuthProvider.REDDIT]: getRedditReputationParams,
    [OAuthProvider.TWITTER]: getTwitterReputationParams
}
export async function calculateReputation({
    provider,
    token
}: {
    provider: Exclude<OAuthProvider, OAuthProvider.TWITTER | OAuthProvider.REDDIT>
    token: string
}): Promise<ReputationLevel> {
    const params = await FUNCS[provider](token)
    return calculateProviderReputation(provider, params) as ReputationLevel
}
