import { ReputationLevel } from "@interrep/reputation"
import { PoapEvent } from "src/core/poap"
import { Provider } from "src/types/groups"
import sendRequest from "./sendRequest"

export function sendEmail({ email }: { email: string }) {
    return sendRequest(`/api/email/send`, {
        email
    })
}

export function getUserBadges({ userAddress }: { userAddress: string }): Promise<any | null> {
    return sendRequest(`/api/badges/?userAddress=${userAddress}`)
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

export async function isLinkedToAddress(): Promise<boolean | null> {
    return sendRequest("/api/badges/is-linked")
}

export async function hasJoinedAGroup(): Promise<boolean | null> {
    return sendRequest(`/api/groups/has-joined`)
}

export function mintBadge({ tokenId, accountId }: { tokenId: string; accountId: string }): Promise<any | null> {
    return sendRequest(
        `/api/badges/${tokenId}/mint`,
        {
            accountId
        },
        "POST"
    )
}

export function hasIdentityCommitment({
    provider,
    groupName,
    identityCommitment
}: {
    provider: Provider
    groupName: ReputationLevel | PoapEvent | string
    identityCommitment: string
}): Promise<any | null> {
    return sendRequest(`/api/groups/${provider}/${groupName}/${identityCommitment}`)
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

export function unlinkAccounts({
    attestationMessage,
    attestationSignature,
    accountId
}: {
    attestationMessage: string
    attestationSignature: string
    accountId: string
}): Promise<any | null> {
    return sendRequest("/api/badges/unlink", { attestationMessage, attestationSignature, accountId }, "PUT")
}

export function linkAccounts({
    userAddress,
    accountId,
    userSignature,
    userPublicKey
}: {
    userAddress: string
    accountId: string
    userSignature: string
    userPublicKey: string
}): Promise<any | null> {
    return sendRequest(
        "/api/badges/link",
        {
            userAddress,
            accountId,
            userSignature,
            userPublicKey
        },
        "PUT"
    )
}
