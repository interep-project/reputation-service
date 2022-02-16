/* istanbul ignore file */
import { ReputationLevel } from "@interep/reputation"
import { PoapEvent } from "src/core/poap"
import { Provider } from "src/types/groups"
import sendRequest from "./sendRequest"

export function sendEmail({ email }: { email: string }) {
    return sendRequest(`/api/email/send`, {
        email
    })
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

export async function hasJoinedAGroup(): Promise<boolean | null> {
    return sendRequest(`/api/groups/has-joined`)
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
