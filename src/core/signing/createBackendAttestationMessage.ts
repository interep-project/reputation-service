export type BackendAttestationMessageParams = {
    address: string
    decimalId: string
    provider: string
    providerAccountId: string
}

export const createBackendAttestationMessage = ({
    address,
    decimalId,
    provider,
    providerAccountId
}: BackendAttestationMessageParams): string =>
    JSON.stringify({
        service: "InterRep",
        decimalId,
        userAddress: address,
        web2Provider: provider,
        providerAccountId: providerAccountId
    })
