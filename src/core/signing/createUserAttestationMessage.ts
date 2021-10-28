export type UserAttestationMessageParams = {
    checksummedAddress: string
    accountId: string
}
// TODO: Improve with more explicit message to sign
export const createUserAttestationMessage = ({ checksummedAddress, accountId }: UserAttestationMessageParams): string =>
    `InterRep:${checksummedAddress}:${accountId}`
