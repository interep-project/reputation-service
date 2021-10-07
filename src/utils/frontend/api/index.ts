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
    name
}: {
    provider: Provider
    name: ReputationLevel | PoapGroupName
}): Promise<any | null> {
    return sendRequest(`/api/groups/${provider}/${name}`)
}

export async function checkLink(): Promise<boolean | null> {
    return sendRequest("/api/linking/check")
}

export async function checkGroup(): Promise<boolean | null> {
    return sendRequest(`/api/groups/check`)
}

export async function checkIdentityCommitment({
    provider,
    name,
    identityCommitment
}: {
    provider: Provider
    name: ReputationLevel | PoapGroupName
    identityCommitment: string
}): Promise<boolean | null> {
    return sendRequest(`/api/groups/${provider}/${name}/${identityCommitment}/check`)
}

export function mintToken({ tokenId }: { tokenId: string }): Promise<any | null> {
    return sendRequest(`/api/tokens/${tokenId}/mint`, undefined, "POST")
}

export function addIdentityCommitment({
    provider,
    name,
    identityCommitment,
    web2AccountId,
    userAddress,
    userSignature
}: {
    provider: Provider
    name: ReputationLevel | PoapGroupName
    identityCommitment: string
    web2AccountId?: string
    userAddress?: string
    userSignature?: string
}): Promise<any | null> {
    return sendRequest(`/api/groups/${provider}/${name}/${identityCommitment}`, {
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
