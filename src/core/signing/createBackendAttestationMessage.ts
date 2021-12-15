export type BackendAttestationMessageParams = {
    userAddress: string
    tokenId: string
    provider: string
    providerAccountId: string
}

export const createBackendAttestationMessage = ({
    userAddress,
    tokenId,
    provider,
    providerAccountId
}: BackendAttestationMessageParams): string =>
    JSON.stringify({
        tokenId,
        userAddress,
        provider,
        providerAccountId
    })
