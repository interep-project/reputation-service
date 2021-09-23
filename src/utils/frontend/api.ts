import { Web2Provider } from "@interrep/reputation-criteria"

async function sendRequest(url: string, body?: any, method = body ? "POST" : "GET"): Promise<any | null> {
    const response = await fetch(url, {
        method,
        body: JSON.stringify(body)
    })

    if (response.status !== 200 && response.status !== 201) {
        const error = await response.text()

        console.error(error || `HTTP method ${method} failed`)

        return null
    }

    try {
        const { data } = await response.json()

        return data
    } catch {
        return undefined
    }
}

export function getReputation({
    web2Provider,
    username
}: {
    web2Provider: Web2Provider
    username: string
}): Promise<any | null> {
    return sendRequest(`/api/reputation/${web2Provider}/${username}`)
}

export function getMyTokens({ ownerAddress }: { ownerAddress: string }): Promise<any | null> {
    return sendRequest(`/api/tokens/?owner=${ownerAddress}`)
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
    return sendRequest("/api/tokens/mint", { tokenId })
}

export function addIdentityCommitment({
    groupId,
    identityCommitment,
    web2AccountId
}: {
    groupId: string
    identityCommitment: string
    web2AccountId: string
}): Promise<any | null> {
    return sendRequest(`/api/groups/${groupId}/${identityCommitment}`, {
        web2AccountId
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
