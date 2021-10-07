import { ReputationLevel, Web2Provider } from "@interrep/reputation-criteria"
import { PoapGroupName } from "src/core/groups/poap"
import { Provider } from "src/types/groups"
import sendRequest from "./sendRequest"

export function getReputation({
    web2Provider,
    username
}: {
    web2Provider: Web2Provider
    username: string
}): Promise<any | null> {
    return sendRequest(`/api/reputation/${web2Provider}/${username}`)
}

export function getUserTokens({ userAddress }: { userAddress: string }): Promise<any | null> {
    return sendRequest(`/api/tokens/?userAddress=${userAddress}`)
}

export function getGroup({
    provider,
    reputationOrName
}: {
    provider: Provider
    reputationOrName: ReputationLevel | PoapGroupName
}): Promise<any | null> {
    return sendRequest(`/api/groups/${provider}/${reputationOrName}`)
}

export async function checkLink(): Promise<boolean | null> {
    return sendRequest("/api/linking/check")
}

export async function checkGroup(): Promise<boolean | null> {
    return sendRequest(`/api/groups/check`)
}

export async function checkIdentityCommitment({
    provider,
    reputationOrName,
    identityCommitment
}: {
    provider: Provider
    reputationOrName: ReputationLevel | PoapGroupName
    identityCommitment: string
}): Promise<boolean | null> {
    return sendRequest(`/api/groups/${provider}/${reputationOrName}/${identityCommitment}/check`)
}

export function mintToken({ tokenId }: { tokenId: string }): Promise<any | null> {
    return sendRequest(`/api/tokens/${tokenId}/mint`, undefined, "POST")
}

export function addIdentityCommitment({
    provider,
    reputationOrName,
    identityCommitment,
    web2AccountId,
    userAddress,
    userSignature
}: {
    provider: Provider
    reputationOrName: ReputationLevel | PoapGroupName
    identityCommitment: string
    web2AccountId?: string
    userAddress?: string
    userSignature?: string
}): Promise<any | null> {
    return sendRequest(`/api/groups/${provider}/${reputationOrName}/${identityCommitment}`, {
        web2AccountId,
        userAddress,
        userSignature
    })
}

export function unlinkAccounts({ decryptedAttestation }: { decryptedAttestation: string }): Promise<any | null> {
    return sendRequest("/api/linking/unlink", { decryptedAttestation })
}

export function linkAccounts({
    address,
    web2AccountId,
    userSignature,
    userPublicKey
}: {
    address: string
    web2AccountId: string
    userSignature: string
    userPublicKey: string
}): Promise<any | null> {
    return sendRequest(
        "/api/linking/link",
        {
            address,
            web2AccountId,
            userSignature,
            userPublicKey
        },
        "PUT"
    )
}
