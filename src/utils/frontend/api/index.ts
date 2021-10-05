import { Web2Provider } from "@interrep/reputation-criteria"
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

export function getGroup({ groupId }: { groupId: string }): Promise<any | null> {
    return sendRequest(`/api/groups/${groupId}`)
}

export async function checkLink(): Promise<boolean | null> {
    return sendRequest("/api/linking/check")
}

export async function checkGroup(): Promise<boolean | null> {
    return sendRequest(`/api/groups/check`)
}

export async function checkIdentityCommitment({
    groupId,
    identityCommitment
}: {
    groupId: string
    identityCommitment: string
}): Promise<boolean | null> {
    return sendRequest(`/api/groups/${groupId}/${identityCommitment}/check`)
}

export function mintToken({ tokenId }: { tokenId: string }): Promise<any | null> {
    return sendRequest(`/api/tokens/${tokenId}/mint`, undefined, "POST")
}

export function addIdentityCommitment({
    groupId,
    identityCommitment,
    web2AccountId,
    userAddress,
    userSignature
}: {
    groupId: string
    identityCommitment: string
    web2AccountId?: string
    userAddress?: string
    userSignature?: string
}): Promise<any | null> {
    return sendRequest(`/api/groups/${groupId}/${identityCommitment}`, {
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
