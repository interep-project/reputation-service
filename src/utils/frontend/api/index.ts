import { ReputationLevel, OAuthProvider } from "@interrep/reputation"
import { PoapEvent } from "src/core/poap"
import { Provider } from "src/types/groups"
import sendRequest from "./sendRequest"

export function sendEmail({ email }: { email: string }) {
    return sendRequest(`/api/email/send`, {
        email
    })
}

export function getReputation({
    provider,
    username
}: {
    provider: OAuthProvider
    username: string
}): Promise<any | null> {
    return sendRequest(`/api/reputation/${provider}/${username}`)
}

export function getUserTokens({ userAddress }: { userAddress: string }): Promise<any | null> {
    return sendRequest(`/api/tokens/?userAddress=${userAddress}`)
}

export function getGroup({
    provider,
    groupName
}: {
    provider: Provider
    groupName: ReputationLevel | PoapEvent | string
}): Promise<any | null> {
    return sendRequest(`/api/groups/${provider}/${groupName}`)
}

export async function checkLink(): Promise<boolean | null> {
    return sendRequest("/api/linking/check")
}

export async function checkGroup(): Promise<boolean | null> {
    return sendRequest(`/api/groups/check`)
}

export async function checkIdentityCommitment({
    provider,
    groupName,
    identityCommitment
}: {
    provider: Provider
    groupName: ReputationLevel | PoapEvent | string
    identityCommitment: string
}): Promise<boolean | null> {
    return sendRequest(`/api/groups/${provider}/${groupName}/${identityCommitment}/check`)
}

export function mintToken({ tokenId }: { tokenId: string }): Promise<any | null> {
    return sendRequest(`/api/tokens/${tokenId}/mint`, undefined, "POST")
}

export function addIdentityCommitment({
    provider,
    groupName,
    identityCommitment,
    accountId,
    userAddress,
    userSignature,
    telegramUserId,
    emailUserId,
    emailUserToken
}: {
    provider: Provider
    groupName: ReputationLevel | PoapEvent | string
    identityCommitment: string
    accountId?: string
    userAddress?: string
    userSignature?: string
    telegramUserId?: string
    emailUserId?: string
    emailUserToken?: string
}): Promise<any | null> {
    return sendRequest(`/api/groups/${provider}/${groupName}/${identityCommitment}`, {
        accountId,
        userAddress,
        userSignature,
        telegramUserId,
        emailUserId,
        emailUserToken
    })
}

export function removeIdentityCommitment({
    provider,
    groupName,
    identityCommitment,
    accountId,
    userAddress,
    userSignature,
    telegramUserId,
    emailUserId,
    emailUserToken
}: {
    provider: Provider
    groupName: ReputationLevel | PoapEvent | string
    identityCommitment: string
    accountId?: string
    userAddress?: string
    userSignature?: string
    telegramUserId?: string
    emailUserId?: string
    emailUserToken?: string
}): Promise<any | null> {
    return sendRequest(
        `/api/groups/${provider}/${groupName}/${identityCommitment}`,
        {
            accountId,
            userAddress,
            userSignature,
            telegramUserId,
            emailUserId,
            emailUserToken
        },
        "DELETE"
    )
}

export function unlinkAccounts({ decryptedAttestation }: { decryptedAttestation: string }): Promise<any | null> {
    return sendRequest("/api/linking/unlink", { decryptedAttestation })
}

export function linkAccounts({
    address,
    accountId,
    userSignature,
    userPublicKey
}: {
    address: string
    accountId: string
    userSignature: string
    userPublicKey: string
}): Promise<any | null> {
    return sendRequest(
        "/api/linking/link",
        {
            address,
            accountId,
            userSignature,
            userPublicKey
        },
        "PUT"
    )
}
